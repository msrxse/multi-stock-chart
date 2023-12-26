import { useEffect, useState } from 'react';
import MainGraph from './Graph/MainGraph';
import { MainContainerProps } from './utils/types';

import styles from './MainContainer.module.css';

function MainContainer(props: MainContainerProps) {
  const { companyId, pricing, options, optionsDefault, optionsInstruments } = props;

  const [selectedMetric, setSelectedMetric] = useState({
    label: '',
    value: '',
  });

  useEffect(() => {
    if (optionsDefault !== selectedMetric.label) {
      setSelectedMetric({
        label: optionsDefault,
        value: optionsDefault,
      });
    }
  }, [optionsDefault]);

  /**
   * Fires when user clicks on a chart label in legend
   */
  const handleSelectSeries = ({ trancheId }: { trancheId: string }) => {
    props.handleSelectSeries({
      trancheId,
      defaultSelected: selectedMetric.label,
    });
  };

  return (
    <div className={styles.mainGraph} data-testid="pricing-chart">
      <MainGraph
        companyId={companyId}
        dataset={pricing}
        options={options}
        optionsInstruments={optionsInstruments}
        width={1000}
        height={500}
        handleSelectSeries={handleSelectSeries}
        selectedMetric={selectedMetric}
      />
    </div>
  );
}

export default MainContainer;
