import { useState, useEffect } from 'react';
import { scaleLinear, scaleUtc } from 'd3-scale';
import { extent } from 'd3-array';
import Graph from './Graph';
import Axis from './Axis';
import { margin } from '../utils/margin';
import { Series, GraphContainerProps, Scales } from '../utils/types';

import styles from '../allCss.module.css';

function GraphContainer(props: GraphContainerProps) {
  const { companyId, width, height, seriesList, selectedDates } = props;
  const getScales = () => {
    // calculate scale domains
    const timeDomain = extent(selectedDates);
    const allLinesData = seriesList.flatMap((series: Series) => series.values);
    const valueDomain = extent(allLinesData as number[]);
    // set scale ranges to width and height of container
    const xScale = scaleUtc()
      .range([margin.left, width - margin.right])
      .domain(timeDomain as unknown as [number, number]);
    const yScale = scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain(valueDomain as unknown as [number, number])
      .nice();

    return { xScale, yScale };
  };
  const [scales, setScales] = useState<Scales>(getScales());
  const [scaleDomains, setScaleDomains] = useState(false);

  // this deals with re-scaling and re-drawing graphs on window resize
  useEffect(() => {
    const scales = getScales();
    setScales(scales);
  }, [width, height]);

  useEffect(() => {
    const scales = getScales();
    setScaleDomains(true);
    setScales(scales);
  }, [seriesList]);

  // replace spaces for dash and all lowercase
  const companyIdSelector = companyId.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className={styles.graphContainerWrapper}>
      <div className={styles.graphContainer}>
        {scaleDomains && (
          <>
            <svg width={margin.yAxis} height={height}>
              <Axis width={width} height={height} orientation="left" scale={scales.yScale} x={margin.yAxis} y={0} />
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
                  animateTransition={props.animateTransition}
                  series={props.seriesList}
                  selectedDates={props.selectedDates}
                  width={width}
                  height={height}
                  x={0}
                  y={0}
                  xScale={scales.xScale}
                  yScale={scales.yScale}
                  currentHoveredSerieIndex={props.currentHoveredSerieIndex}
                />
              </g>
            </svg>
          </>
        )}
      </div>
    </div>
  );
}

export default GraphContainer;
