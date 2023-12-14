import React, { Component } from 'react';
import moment from 'moment';
import { line } from 'd3-shape';
import { bisectLeft, least, ascending } from 'd3-array';
import { select } from 'd3-selection';
import { easeCubicOut, easeCubicIn } from 'd3-ease';
import { Popover } from 'antd';
// import Popover from '../../components/Popover';
import Icon from '../../Icon/Icon';
import generateRamdomId from '../utils/generateRamdomId';
import Axis from './Axis';
import { colors } from '../utils/colors';
import { margin } from '../utils/margin';
import DateFilterLegend from './DateFilterLegend';

import styles from './Graph.module.css';

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      series: this.props.series,
      selectedDates: this.props.selectedDates,
      // lineGenerator: line(), // line().defined(d => !isNaN(d)),
      lineGenerator: line().defined((d) => d !== null),
      simPaths: [],
      hoveredSimPathId: null,
      tooltipXPos: 0,
      tooltipYPos: 0,
      currentSeriesSelected: [],
    };

    this.simPathsRef = React.createRef();
  }

  componentDidMount() {
    const { series, selectedDates } = this.state;

    this.drawSimPaths(series, selectedDates);
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedDates, series, width, animateTransition } = this.props;

    if (series !== prevProps.series) {
      const { lineGenerator } = prevState;

      this.updateSimPaths(
        series,
        selectedDates,
        lineGenerator,
        animateTransition,
        width
      );
    }

    const { xScale, yScale } = this.props;

    if (xScale !== prevProps.xScale || yScale !== prevProps.yScale) {
      const { lineGenerator } = prevState;

      this.updateSimPaths(
        series,
        selectedDates,
        lineGenerator,
        animateTransition,
        width
      );
    }
  }

  drawSimPaths = (series, selectedDates) => {
    const { lineGenerator } = this.state;
    const { xScale, yScale } = this.props;

    lineGenerator.x((d, i) => xScale(selectedDates[i]));
    lineGenerator.y((d) => yScale(d));
    // generate simPaths from lineGenerator
    const simPaths = series.map((d) => lineGenerator(d.values));

    // set new values to state
    this.setState({
      series,
      selectedDates,
      lineGenerator,
      simPaths,
    });
  };

  updateSimPaths = (
    series,
    selectedDates,
    lineGenerator,
    animateTransition
  ) => {
    // Animate simPath color but don't change data
    if (this.simPathsRef.current) {
      // update lineGenerator from new scale and data
      lineGenerator.x((d, i) => this.props.xScale(selectedDates[i]));
      lineGenerator.y((d) => this.props.yScale(d));
      // generate simPaths from lineGenerator
      const simPaths = series.map((d) => lineGenerator(d.values));

      // reDraw lines if series get added and
      // also if the selectedDates have changed (with brush filter)
      if (
        simPaths.length !== this.state.simPaths.length ||
        selectedDates.length !== this.state.selectedDates.length
      ) {
        // re-draw simPaths in render
        this.drawSimPaths(series, selectedDates);
      } else {
        this.drawSimPaths(series, selectedDates);

        // update simPaths since same number
        // get svg node
        const simPathsNode = select(this.simPathsRef.current);

        if (!animateTransition) {
          const paths = simPathsNode
            .selectAll('.simPath')
            .data(series)

            // paths.exit().remove()
            // paths.enter().append('path')
            .attr('d', (d) => lineGenerator(d.values))
            // .attr('stroke', () => colors.green)
            .on('end', () => {
              // set new values to state
              this.setState({
                series,
                selectedDates,
                lineGenerator,
                simPaths,
              });
            });
          const hoverPaths = simPathsNode
            .selectAll('.simPath-hover')
            .data(series)
            // hoverPaths.exit().remove()
            // hoverPaths.enter().append('path')
            .attr('d', (d) => lineGenerator(d.values));
        } else {
          const paths = simPathsNode
            .selectAll('.simPath')
            .data(series)
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
              this.setState({
                series,
                selectedDates,
                lineGenerator,
                simPaths,
              });
            });

          simPathsNode
            .selectAll('.simPath-hover')
            .data(series)
            .attr('d', (d) => lineGenerator(d.values));
        }
      }
    }
  };

  handleMouseLeave = () => {
    this.setState({ hoveredSimPathId: null, hoveredSimPathDate: null });
  };

  handleBetterSimMouseHover = (event) => {
    event.preventDefault();
    const selector = `.graphSVG_${this.props.keyVal}`;
    const node = document.querySelector(selector);

    if (!node) {
      return undefined;
    }
    let point = node.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(node.getScreenCTM().inverse());
    const xm = this.props.xScale.invert(point.x);
    const ym = this.props.yScale.invert(point.y);
    const i1 = bisectLeft(this.props.selectedDates, xm, 1);
    const i0 = i1 - 1;
    const i =
      xm - this.props.selectedDates[i0] > this.props.selectedDates[i1] - xm
        ? i1
        : i0;
    const s = least(this.props.series, (d) => Math.abs(d.values[i] - ym));
    // list of series in the path of yPos
    const currentSeriesSelected = this.props.series.reduce((acc, serie) => {
      if (serie.values[i]) {
        acc.push({
          ...serie,
          tooltipYPos: this.props.yScale(serie.values[i]),
        });
      }

      return acc;
    }, []);

    if (s) {
      const hoveredIdx = this.props.series.findIndex(
        (sim) => sim.key === s.key
      );

      this.setState({
        hoveredSimPathId: hoveredIdx,
        hoveredSimPathDate: moment.utc(xm).local().format('DD-MMM-YYYY'),
        tooltipText: s.key,
        tooltipXPos: this.props.xScale(this.props.selectedDates[i]),
        tooltipYPos: this.props.yScale(ym),
        currentSeriesSelected,
      });
    }
    return undefined;
  };

  formatTrancheName = (tranche) => {
    const {
      amount = '',
      currencyRefCode,
      coupon = '',
      maturity,
      debtSecurityRefName,
    } = tranche;

    return `
      ${currencyRefCode}
      ${amount === null ? '' : amount}
      ${coupon === null ? '' : coupon}
      ${debtSecurityRefName} due
      ${maturity}
      `;
  };

  /**
   * Uses currenteSelected series (series that exist in the Ypath of the y mouse position)
   * Also sorted ascending
   */
  getPopoverContent = () => {
    return this.state.currentSeriesSelected
      .sort((x, y) => {
        return ascending(x.tooltipYPos, y.tooltipYPos);
      })
      .map((serie) => (
        <div key={`serie-${generateRamdomId()}`} className={styles.popover}>
          <Icon icon="dot" color={serie.color} size="16" />

          {this.state.tooltipText === serie.key ? (
            <div className={styles.hoveredSerieInPopover}>
              {this.formatTrancheName(serie)}
            </div>
          ) : (
            this.formatTrancheName(serie)
          )}
        </div>
      ));
  };

  getColorOfSelectedSeries = () => {
    return this.props.series.map((serie) =>
      this.state.hoveredSimPathId === serie.key ? serie.color : colors.gray
    );
  };

  render() {
    return (
      <g
        width={this.props.width}
        height={this.props.height}
        transform={`translate(${this.props.x}, ${this.props.y})`}
        ref={this.simPathsRef}
        onMouseLeave={this.handleMouseLeave}
      >
        <g>
          <rect
            x={margin.left}
            y={margin.top}
            className="graphArea"
            id={`graphArea_${this.props.keyVal}`}
            width={this.props.width - margin.left - margin.right}
            height={this.props.height - margin.bottom - margin.top}
            fill={colors.graphBkgd}
            onMouseMove={this.handleBetterSimMouseHover}
          />
          {
            // visible simPaths
            this.state.simPaths.map((simPath, i) => {
              return (
                <path
                  d={simPath}
                  key={`simPath-${generateRamdomId()}`}
                  id={`simPath-${i}`}
                  className="simPath"
                  fill="none"
                  // stroke={this.state.series[i].over ? colors.red : colors.green}
                  stroke={this.state.series[i].color}
                  strokeWidth="2"
                  strokeOpacity={
                    this.props.currentHoveredSerieIndex === -1 ||
                    this.props.currentHoveredSerieIndex === i
                      ? 1
                      : 0.3
                  }
                />
              );
            })
          }
          {
            // highlight simPaths
            this.state.simPaths.map((simPath, i) => {
              const simIsHovered = i === this.state.hoveredSimPathId;

              return (
                <path
                  d={simPath}
                  key={`simPath-${generateRamdomId()}-hover`}
                  id={`simPath-${i}-hover`}
                  className="simPath-hover"
                  fill="none"
                  stroke={
                    simIsHovered
                      ? this.getColorOfSelectedSeries()
                      : colors.lightGray
                  }
                  strokeWidth="2"
                  strokeOpacity={
                    typeof this.state.hoveredSimPathId === 'number' ? 1 : 0
                  }
                />
              );
            })
          }
          <Popover
            key="sim-tooltip"
            title={this.state.hoveredSimPathDate}
            content={this.getPopoverContent()}
            placement="rightBottom"
            visible={this.state.hoveredSimPathDate}
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
                cx={this.state.tooltipXPos}
                cy={this.state.tooltipYPos}
                r={10}
                fill={colors.gray}
                fillOpacity={0}
                className="tooltipCircle"
              />
              {this.state.currentSeriesSelected.map((serie) => (
                <circle
                  key={`serie-${generateRamdomId()}`}
                  cx={this.state.tooltipXPos}
                  cy={serie.tooltipYPos}
                  r={4}
                  strokeWidth={2}
                  stroke={colors.black}
                  strokeOpacity={this.state.hoveredSimPathDate ? 1 : 0}
                  fill={serie.color}
                  fillOpacity={this.state.hoveredSimPathDate ? 1 : 0}
                  className="tooltipCircle"
                />
              ))}
            </>
          </Popover>

          <line
            key="mouse-vertical-line"
            className="mouse-vertical-line"
            x1={this.state.tooltipXPos}
            y1={this.props.height - margin.bottom}
            x2={this.state.tooltipXPos}
            y2={0 - margin.top}
            stroke={colors.gray}
            strokeWidth={1}
            strokeOpacity={this.state.hoveredSimPathDate ? 1 : 0}
            style={{ pointerEvents: 'none' }}
          />
        </g>

        <DateFilterLegend x={margin.left} y={margin.top} />

        <g>
          <Axis
            keyVal={this.props.keyVal}
            width={this.props.width - margin.left}
            height={this.props.height}
            orientation="bottom"
            view="graph"
            scale={this.props.xScale}
            x={0}
            y={this.props.height - margin.bottom}
            // y={0}
          />
        </g>
      </g>
    );
  }
}

export default Graph;
