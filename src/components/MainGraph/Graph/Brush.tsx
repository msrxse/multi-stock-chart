import { useEffect, useRef, useState } from 'react';
import { axisBottom } from 'd3-axis';
import { scaleLinear, scaleUtc } from 'd3-scale';
import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { timeFormat } from 'd3-time-format';
import { brushX, brushSelection } from 'd3-brush';
import { max, extent } from 'd3-array';
import { easeCubicOut } from 'd3-ease';
import { margin } from '../utils/margin';
import generateRamdomId from '../utils/generateRamdomId';
import { BrushProps } from '../utils/types';

import styles from '../allCss.module.css';

const yearDateFormat = '%b-%Y';

function Brush(props: BrushProps) {
  const { x, y, series, dates, dateRange, width, height, animateTransition, onBrushChange, onBrushStart, onBrushEnd } =
    props;

  const getScales = (series, dates, width, height) => {
    // calculate scale domains
    const timeDomain = extent(dates);
    // const maxVal = max(series, sims => max(sims.values));
    const allLinesData = series.flatMap((s) => s.values);
    const valueDomain = extent(allLinesData);
    // set scale ranges to width and height of container
    const xScale = scaleUtc()
      .range([margin.left, width - margin.right])
      .domain(timeDomain);
    const yScale = scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain(valueDomain)
      .nice();

    return { xScale, yScale };
  };

  const [scales, setScales] = useState(() => getScales(series, dates, width, height));
  // const [lineGenerator, setLineGenerator] = useState(line().defined(d => !isNaN(d)));
  const [lineGenerator, setLineGenerator] = useState(() => line().defined((d) => d !== null));
  const [simPaths, setSimPaths] = useState([]);

  const xAxisRef = useRef(null);
  const simPathsRef = useRef(null);
  const brushRef = useRef(null);

  const brushed = (event) => {
    const { selection } = event;
    // on first load onBrushChange cant be call with range = undefined (scales needs to exists)
    if (Object.keys(scales).length === 0 || selection === null) {
      return;
    }
    if (event.selection && event.sourceEvent !== null) {
      const [x1, x2] = event.selection;
      const range = [scales.xScale && scales.xScale.invert(x1), scales.xScale && scales.xScale.invert(x2)];
      onBrushChange(range);
    }
  };

  const brushEnded = (event) => {
    if (!event.selection && brushRef.current) {
      const selection = brushSelection(brushRef.current) ? null : scales.xScale.range();

      select(brushRef.current).call(brush.move, selection);
    }

    onBrushEnd();
  };

  const brush = brushX()
    .extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ])
    .on('start', onBrushStart())
    .on('end', brushEnded)
    .on('brush', brushed);
  let xAxis = axisBottom();

  useEffect(() => {
    setupBrush(series, dates, width, height);
  }, []);

  useEffect(() => {
    updateSimPaths(false);
  }, [width, height]);

  useEffect(() => {
    updateSimPaths(animateTransition);
  }, [series.length]);

  const updateSimPaths = (animateTransition: boolean) => {
    const updatedScales = getScales(series, dates, width, height);

    if (simPathsRef.current) {
      // update scale and data

      lineGenerator.x((d, i) => updatedScales.xScale(dates[i]));
      lineGenerator.y((d) => updatedScales.yScale(d));

      // generate simPaths from lineGenerator
      const simPaths = series.map((d) => {
        return lineGenerator(d.values);
      });

      setLineGenerator(() => lineGenerator);
      setSimPaths(simPaths);

      // get svg node
      const simPathsNode = select(simPathsRef.current);

      // update the paths with new data
      if (animateTransition) {
        simPathsNode
          .selectAll('.simPath')
          .data(series)
          .transition()
          .duration(100)
          .ease(easeCubicOut)
          .attr('stroke-opacity', 0)
          .transition()
          .duration(700)
          .ease(easeCubicOut)
          .attr('d', (d) => lineGenerator(d.values))
          // .attr('stroke', () => colors.green)
          .attr('stroke-opacity', 0.6)
          .on('end', () => {
            // set new values to state
            setScales(updatedScales);
          });
      } else {
        simPathsNode
          .selectAll('.simPath')
          .data(series)
          .attr('d', (d) => lineGenerator(d.values));
        // .attr('stroke', () => colors.green);
      }
    }

    if (xAxisRef.current) {
      xAxis.scale(updatedScales.xScale);
      const xAxisNode = select(xAxisRef.current);

      xAxisNode.call(xAxis);
    }
    if (brushRef.current) {
      brush.extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);
      const brushRefNode = select(brushRef.current);

      brushRefNode
        .call(brush)
        .call(brush.move, [updatedScales.xScale(dateRange[0]), updatedScales.xScale(dateRange[1])]);
    }

    // save new scales to state if transition doesn't animate
    setScales(updatedScales);
  };

  const setupBrush = (series, dates, width, height) => {
    const updatedScales = getScales(series, dates, width, height);

    lineGenerator.x((d, i) => updatedScales.xScale(dates[i]));
    lineGenerator.y((d) => {
      return updatedScales.yScale(d);
    });
    // generate simPaths from lineGenerator
    const simPaths = series.map((d) => {
      return lineGenerator(d.values);
    });

    xAxis = axisBottom()
      .scale(updatedScales.xScale)
      .tickFormat((date) => {
        // if (timeYear(date) < timeDay.offset(date, -1)) {
        return timeFormat(yearDateFormat)(date);
        // } else {
        //   return timeFormat('%Y')(date);
        // }
      })
      .ticks(width / 80)
      .tickSizeOuter(0);
    if (xAxisRef.current) {
      select(xAxisRef.current).call(xAxis);
    }

    if (brushRef.current) {
      const brushRefNode = select(brushRef.current);

      brushRefNode
        .call(brush)
        .call(brush.move, [updatedScales.xScale(dateRange[0]), updatedScales.xScale(dateRange[1])]);
    }
    // set new values to state
    setScales(updatedScales);
    setLineGenerator(() => lineGenerator);
    setSimPaths(simPaths);
  };

  return (
    <div className={styles.brushWrapper}>
      <svg width={width} height={height} transform={`translate(${x}, ${y})`}>
        <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`} />
        <g ref={simPathsRef}>
          <rect
            x={margin.left}
            y={margin.top}
            width={width - margin.left - margin.right}
            height={height - margin.bottom - margin.top}
            fill="#fbfbfb"
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
                  stroke={series[i]?.color}
                  strokeWidth="1"
                  strokeOpacity={0.4}
                />
              );
            })
          }
        </g>
        <g ref={brushRef} />
      </svg>
    </div>
  );
}

export default Brush;
