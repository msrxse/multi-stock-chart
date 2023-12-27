import { useState, useEffect } from 'react';
import cn from 'classnames';
// import { colors } from '../utils/colors';
// import { margin } from '../utils/margin';
import { getActiveSeriesIds } from '../utils/utils';
import Icon from '../../Icon/Icon';

import styles from '../allCss.module.css';

function formatTrancheName(tranche) {
  const { amount = '', currencyRefCode, coupon = '', maturity, debtSecurityRefName } = tranche;

  return `
    ${currencyRefCode}
    ${amount === null ? '' : amount}
    ${coupon === null ? '' : coupon}
    ${debtSecurityRefName} due
    ${maturity}
    `;
}

function Legend(props) {
  const [seriesColors, setSeriesColors] = useState([]);

  /**
   * Generate array of colors from the index of optionsInstruments mapping
   * Returns array of arrays
   *  - the indexes corresponding to selected series has a color others are empty array
   *  - to keep that index is important so the color is the same as in brush and graph components
   */
  useEffect(() => {
    const colors = Object.values(props.optionsInstruments).map((instrument) => {
      return props.series
        .map((serie) => (serie.key === instrument.trancheId ? serie.color : undefined))
        .filter((x) => x);
    });

    setSeriesColors(colors);
  }, [props.optionsInstruments, props.series]);

  if (!props.optionsInstruments) {
    return null;
  }
  const activeSeriesIds = getActiveSeriesIds(props.selectedSeriesIds);

  return (
    <div className={styles.legendContainer}>
      <ul style={{ marginLeft: props.x, width: props.width }}>
        {Object.values(props.optionsInstruments).map((instrument, i) => (
          <li
            key={instrument.trancheId}
            className={cn(styles.listItem, {
              [styles.active]: Array.from(activeSeriesIds.keys()).includes(instrument.trancheId),
            })}
          >
            <button
              type="button"
              className={styles.listButton}
              onClick={() => props.handleSelectSeries(instrument)}
              onKeyDown={() => {}}
              onMouseEnter={() => props.setCurrentHoveredSerieIndex(instrument.trancheId)}
              onMouseLeave={() => props.setCurrentHoveredSerieIndex(-1)}
              onFocus={() => {}}
            >
              <Icon
                icon="dot"
                size="8"
                // color={props.series[instrument.trancheId]?.color || '#fff'}
                color={seriesColors[i]?.length ? seriesColors[i] : 'lightgrey'}
              />
              <span>{formatTrancheName(instrument)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
    // <div className={styles.legendContainer}>
    //   <svg
    //     width={props.width}
    //     height={props.height}
    //     transform={`translate(${props.x}, ${props.y})`}
    //   >
    //     {Object.values(props.optionsInstruments).map((instrument, i) => (
    //       <g
    //         className="legend"
    //         onClick={() => props.handleSelectSeries(instrument)}
    //         transform={`translate(0, ${i * 15 + 10})`}
    //       >
    //         <rect
    //           x={i}
    //           y={i}
    //           width={20}
    //           height={2.5}
    //           fill={colors.red}
    //           fillOpacity={0.5}
    //         />
    //         <text x={i + 25} y={i + 4} opacity={0.65} className="titleNarrow">
    //           {formatTrancheName(instrument)}
    //         </text>
    //       </g>
    //     ))}
    //   </svg>
    // </div>
  );
}

export default Legend;
