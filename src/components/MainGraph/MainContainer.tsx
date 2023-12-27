import MainGraph from './Graph/MainGraph';
import { Instrument, MainContainerProps } from './utils/types';

import styles from './MainContainer.module.css';

function MainContainer(props: MainContainerProps) {
  const { companyId, pricing, optionsInstruments } = props;

  /**
   * Fires when user clicks on a chart label in legend
   */
  const handleSelectSeries = (instrument: Instrument) => {
    props.handleSelectSeries(instrument);
  };

  return (
    <div className={styles.mainGraph} data-testid="pricing-chart">
      <MainGraph
        companyId={companyId}
        dataset={pricing}
        optionsInstruments={optionsInstruments}
        width={1000}
        height={500}
        handleSelectSeries={handleSelectSeries}
      />
    </div>
  );
}

export default MainContainer;
