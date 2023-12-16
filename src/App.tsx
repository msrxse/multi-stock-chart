import MainContainer from './components/MainGraph/MainContainer';

import {
  match,
  dates,
  series,
  optionsFetching,
  options,
  optionsDefault,
  optionsInstruments,
} from './mainData.json';

import styles from './App.module.css';

function App(): JSX.Element {
  return (
    <div className={styles.app}>
      <MainContainer
        companyId={match.params.companyId}
        pricing={{ dates, series }}
        optionsFetching={optionsFetching}
        options={options}
        optionsDefault={optionsDefault}
        optionsInstruments={optionsInstruments}
        handleMetricSelection={() => {}}
        handleSelectChartSeries={() => {}}
        isSidebarLayout
        // trancheId // only in single instruments view
      />
    </div>
  );
}

export default App;
