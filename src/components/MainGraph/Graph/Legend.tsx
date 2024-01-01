import cn from 'classnames';
import { getActiveSeriesIds } from '../utils/utils';
import Icon from '../../Icon/Icon';
import { Instrument, LegendProps } from '../utils/types';

import styles from '../allCss.module.css';

function formatTrancheName(tranche: Instrument) {
  const { amount = '', currencyRefCode, coupon = '', maturity, debtSecurityRefName } = tranche;

  return `
    ${currencyRefCode}
    ${amount === null ? '' : amount}
    ${coupon === null ? '' : coupon}
    ${debtSecurityRefName} due
    ${maturity}
    `;
}

function Legend(props: LegendProps) {
  if (!props.optionsInstruments) {
    return null;
  }
  const activeSeriesIds = getActiveSeriesIds(props.selectedSeriesIds);
  const grabInstrumentColorFromSerie = (trancheId: string) =>
    props.series.reduce((acc, serie) => {
      if (serie.key === trancheId) {
        return serie.color;
      }
      return acc;
    }, 'lightgrey');

  return (
    <div className={styles.legendContainer}>
      <ul style={{ marginLeft: props.x, width: props.width }}>
        {Object.values(props.optionsInstruments).map((instrument) => (
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
              <Icon size="8" color={grabInstrumentColorFromSerie(instrument.trancheId)} />
              <span>{formatTrancheName(instrument)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Legend;
