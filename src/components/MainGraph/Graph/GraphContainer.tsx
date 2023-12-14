import React, { Component, Fragment } from 'react';
import { scaleLinear, scaleUtc } from 'd3-scale';
import { extent } from 'd3-array';
import Graph from './Graph';
import Axis from './Axis';
import { margin } from '../utils/margin';

import styles from '../allCss.module.css';

class GraphContainer extends Component {
  state = {
    scales: {},
    scaleDomains: false,
  };

  componentDidMount() {
    const { width, height, seriesList, selectedDates } = this.props;

    if (seriesList.length > 0) {
      const scales = this.getScales(seriesList, selectedDates, width, height);

      this.setState({ scaleDomains: true });
      this.updateGraphs(scales);
    }
  }

  componentDidUpdate(prevProp) {
    const { seriesList, selectedDates, width, height } = this.props;

    // this deals with re-scaling and re-drawing graphs on window resize
    if (
      prevProp.width !== this.props.width ||
      prevProp.height !== this.props.height
    ) {
      const scales = this.getScales(seriesList, selectedDates, width, height);

      this.updateGraphs(scales);
    }

    if (prevProp.seriesList !== this.props.seriesList) {
      const scales = this.getScales(seriesList, selectedDates, width, height);

      this.setState({ scaleDomains: true });
      this.updateGraphs(scales);
    }
  }

  updateGraphs = (scales) => {
    this.setState({
      scales,
    });
  };

  getScales = (seriesList, selectedDates, width, height) => {
    // calculate scale domains
    const timeDomain = extent(selectedDates);
    const allLinesData = seriesList.flatMap((series) => series.values);
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

  render() {
    const { scales } = this.state;
    const { companyId, width, height } = this.props;
    // replace spaces for dash and all lowercase
    const companyIdSelector = companyId.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className={styles.graphContainerWrapper}>
        <div className={styles.graphContainer}>
          {this.state.scaleDomains && (
            <>
              <svg width={margin.yAxis} height={height}>
                <Axis
                  width={width}
                  height={height}
                  orientation="left"
                  scale={scales.yScale}
                  x={margin.yAxis}
                  y={0}
                />
              </svg>
              <svg
                key={`graphSVG_${companyIdSelector}`}
                width={width}
                height={height}
                className={`graphSVG_${companyIdSelector}`}
              >
                <g key={`${companyIdSelector}-graph`}>
                  <Graph
                    key={companyIdSelector}
                    keyVal={companyIdSelector}
                    animateTransition={this.props.animateTransition}
                    series={this.props.seriesList}
                    selectedDates={this.props.selectedDates}
                    width={width}
                    height={height}
                    x={0}
                    y={0}
                    xScale={scales.xScale}
                    yScale={scales.yScale}
                    currentHoveredSerieIndex={
                      this.props.currentHoveredSerieIndex
                    }
                  />
                </g>
              </svg>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default GraphContainer;
