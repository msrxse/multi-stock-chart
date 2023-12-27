import { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import { line } from 'd3-shape';
import { bisectLeft, least, ascending } from 'd3-array';
import { select } from 'd3-selection';
import { easeCubicOut, easeCubicIn } from 'd3-ease';
import { Popover } from 'antd';
import Icon from '../../Icon/Icon';
import generateRamdomId from '../utils/generateRamdomId';
import Axis from './Axis';
import { colors } from '../utils/colors';
import { margin } from '../utils/margin';
import DateFilterLegend from './DateFilterLegend';
import { GraphProps, Tranche } from '../utils/types';

import styles from './Graph.module.css';

function Graph(props: GraphProps) {
  const [simPaths, setSimPaths] = useState<(string | null)[]>([]);
  const [hoveredSimPathId, setHoveredSimPathId] = useState<number | null>(null);
  const [tooltipXPos, setTooltipXPos] = useState(0);
  const [tooltipYPos, setTooltipYPos] = useState(0);
  const [currentSeriesSelected, setCurrentSeriesSelected] = useState([]);
  const [hoveredSimPathDate, setHoveredSimPathDate] = useState<string | null>(null);
  const [tooltipText, setTooltipText] = useState('');

  const [lineGenerator, setLineGenerator] = useState(() => line<number>().defined((d) => d !== null));
  const simPathsRef = useRef<SVGSVGElement>(null);

  /**
   * Just run once
   */
  useEffect(() => {
    drawSimPaths();
  }, []);

  /**
   * We specifically want to update on selectedDates (brush filtering)
   * and also on series.length (user uses legend to add/remove new series)
   */
  useEffect(() => {
    updateSimPaths();
  }, [props.selectedDates, props.series.length]);

  const drawSimPaths = () => {
    lineGenerator.x((d, i) => props.xScale(props.selectedDates[i]));
    lineGenerator.y((d) => props.yScale(d));

    // generate simPaths from lineGenerator
    const simPaths = props.series.map((d) => lineGenerator(d.values));
    setLineGenerator(() => lineGenerator);

    // set new values to state
    setSimPaths(simPaths);
  };

  const updateSimPaths = () => {
    // Animate simPath color but don't change data

    if (simPathsRef.current) {
      // update lineGenerator from new scale and data
      lineGenerator.x((d, i) => props.xScale(props.selectedDates[i]));
      lineGenerator.y((d) => props.yScale(d));

      // generate simPaths from lineGenerator
      const newSimPaths = props.series.map((d) => lineGenerator(d.values));

      // reDraw lines if props.series get added
      if (newSimPaths.length !== simPaths.length) {
        setSimPaths(newSimPaths);
      } else {
        drawSimPaths();

        // update simPaths since same number
        // get svg node
        const simPathsNode = select(simPathsRef.current);

        if (!props.animateTransition) {
          const paths = simPathsNode
            .selectAll('.simPath')
            .data(props.series)

            // paths.exit().remove()
            // paths.enter().append('path')
            .attr('d', (d) => lineGenerator(d.values))
            // .attr('stroke', () => colors.green)
            .on('end', () => {
              // set new values to state
              setLineGenerator(() => lineGenerator);
              setSimPaths(simPaths);
            });
          const hoverPaths = simPathsNode
            .selectAll('.simPath-hover')
            .data(props.series)
            // hoverPaths.exit().remove()
            // hoverPaths.enter().append('path')
            .attr('d', (d) => lineGenerator(d.values));
        } else {
          const paths = simPathsNode
            .selectAll('.simPath')
            .data(props.series)
            // paths.exit().remove()
            // paths.enter().append('path')
            .transition()
            .duration(300)
            .ease(easeCubicIn)
            .attr('stroke-opacity', 0)
            .transition()
            .duration(10)
            .attr('d', (d) => lineGenerator(d.values))
            .transition()
            .duration(400)
            .ease(easeCubicOut)
            // .attr('stroke', () => colors.green)
            .attr('stroke-opacity', 1)
            .on('end', () => {
              // set new values to state
              setLineGenerator(() => lineGenerator);
              setSimPaths(simPaths);
            });

          simPathsNode
            .selectAll('.simPath-hover')
            .data(props.series)
            .attr('d', (d) => lineGenerator(d.values));
        }
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredSimPathId(null);
    setHoveredSimPathDate(null);
  };

  const handleBetterSimMouseHover = (event) => {
    event.preventDefault();
    const selector = `.graphSVG_${props.keyVal}`;
    const node = document.querySelector(selector);

    if (!node) {
      return undefined;
    }
    let point = node.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(node.getScreenCTM().inverse());
    const xm = props.xScale.invert(point.x);
    const ym = props.yScale.invert(point.y);
    const i1 = bisectLeft(props.selectedDates, xm, 1);
    const i0 = i1 - 1;
    const i = xm - props.selectedDates[i0] > props.selectedDates[i1] - xm ? i1 : i0;
    const s = least(props.series, (d) => Math.abs(d.values[i] - ym));
    // list of props.series in the path of yPos
    const currentSeriesSelected = props.series.reduce((acc, serie) => {
      if (serie.values[i]) {
        acc.push({
          ...serie,
          tooltipYPos: props.yScale(serie.values[i]),
        });
      }

      return acc;
    }, []);

    if (s) {
      const hoveredIdx = props.series.findIndex((sim) => sim.key === s.key);

      setHoveredSimPathId(hoveredIdx);
      setHoveredSimPathDate(moment.utc(xm).local().format('DD-MMM-YYYY'));
      setTooltipText(s.key);
      setTooltipXPos(props.xScale(props.selectedDates[i]));
      setTooltipYPos(props.yScale(ym));
      setCurrentSeriesSelected(currentSeriesSelected);
    }
    return undefined;
  };

  const formatTrancheName = (tranche: Tranche) => {
    const { amount = '', currencyRefCode, coupon = '', maturity, debtSecurityRefName } = tranche;

    return `
      ${currencyRefCode}
      ${amount === null ? '' : amount}
      ${coupon === null ? '' : coupon}
      ${debtSecurityRefName} due
      ${maturity}
      `;
  };

  /**
   * Uses currenteSelected props.series (props.series that exist in the Ypath of the y mouse position)
   * Also sorted ascending
   */
  const getPopoverContent = () => {
    return currentSeriesSelected
      .sort((x, y) => {
        return ascending(x.tooltipYPos, y.tooltipYPos);
      })
      .map((serie) => (
        <div key={`serie-${generateRamdomId()}`} className={styles.popover}>
          <Icon icon="dot" color={serie.color} size="16" />

          {tooltipText === serie.key ? (
            <div className={styles.hoveredSerieInPopover}>{formatTrancheName(serie)}</div>
          ) : (
            formatTrancheName(serie)
          )}
        </div>
      ));
  };

  const getColorOfSelectedSeries = () => {
    return props.series.map((serie) => (hoveredSimPathId === serie.key ? serie.color : colors.gray));
  };

  return (
    <g
      width={props.width}
      height={props.height}
      transform={`translate(${props.x}, ${props.y})`}
      ref={simPathsRef}
      onMouseLeave={handleMouseLeave}
    >
      <g>
        <rect
          x={margin.left}
          y={margin.top}
          className="graphArea"
          id={`graphArea_${props.keyVal}`}
          width={props.width - margin.left - margin.right}
          height={props.height - margin.bottom - margin.top}
          fill={colors.graphBkgd}
          onMouseMove={handleBetterSimMouseHover}
        />
        {
          // visible simPaths
          simPaths.map((simPath, i) => {
            return (
              <path
                d={simPath}
                key={`simPath-${generateRamdomId()}`}
                id={`simPath-${i}`}
                className="simPath"
                fill="none"
                // stroke={props.series[i].over ? colors.red : colors.green}
                stroke={props.series[i]?.color || colors.black}
                strokeWidth="2"
                strokeOpacity={props.currentHoveredSerieIndex === -1 || props.currentHoveredSerieIndex === i ? 1 : 0.3}
              />
            );
          })
        }
        {
          // highlight simPaths
          simPaths.map((simPath, i) => {
            const simIsHovered = i === hoveredSimPathId;

            return (
              <path
                d={simPath}
                key={`simPath-${generateRamdomId()}-hover`}
                id={`simPath-${i}-hover`}
                className="simPath-hover"
                fill="none"
                stroke={simIsHovered ? getColorOfSelectedSeries() : colors.lightGray}
                strokeWidth="2"
                strokeOpacity={typeof hoveredSimPathId === 'number' ? 1 : 0}
              />
            );
          })
        }
        <Popover
          key="sim-tooltip"
          title={hoveredSimPathDate}
          content={getPopoverContent()}
          placement="rightBottom"
          visible={hoveredSimPathDate}
          // visible
          // align={{
          //     points: ['bc', 'tc'],        // align top left point of sourceNode with top right point of targetNode
          //     offset: [10, 20],            // the offset sourceNode by 10px in x and 20px in y,
          //     targetOffset: ['0%','0%'], // the offset targetNode by 30% of targetNode width in x and 40% of targetNode height in y,
          //     overflow: { adjustX: true, adjustY: true }, // auto adjust position when sourceNode is overflowed
          //   }}
          data-html="true"
        >
          <>
            <circle
              cx={tooltipXPos}
              cy={tooltipYPos}
              r={10}
              fill={colors.gray}
              fillOpacity={0}
              className="tooltipCircle"
            />
            {currentSeriesSelected.map((serie) => (
              <circle
                key={`serie-${generateRamdomId()}`}
                cx={tooltipXPos}
                cy={serie.tooltipYPos}
                r={4}
                strokeWidth={2}
                stroke={colors.black}
                strokeOpacity={hoveredSimPathDate ? 1 : 0}
                fill={serie.color}
                fillOpacity={hoveredSimPathDate ? 1 : 0}
                className="tooltipCircle"
              />
            ))}
          </>
        </Popover>

        <line
          key="mouse-vertical-line"
          className="mouse-vertical-line"
          x1={tooltipXPos}
          y1={props.height - margin.bottom}
          x2={tooltipXPos}
          y2={0 - margin.top}
          stroke={colors.gray}
          strokeWidth={1}
          strokeOpacity={hoveredSimPathDate ? 1 : 0}
          style={{ pointerEvents: 'none' }}
        />
      </g>

      <DateFilterLegend x={margin.left} y={margin.top} />

      <g>
        <Axis
          keyVal={props.keyVal}
          width={props.width - margin.left}
          height={props.height}
          orientation="bottom"
          view="graph"
          scale={props.xScale}
          x={0}
          y={props.height - margin.bottom}
          // y={0}
        />
      </g>
    </g>
  );
}

export default Graph;
