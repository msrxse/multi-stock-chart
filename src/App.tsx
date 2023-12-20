import MainContainer from './components/MainGraph/MainContainer';

import { dates, series, optionsFetching, options, optionsDefault, optionsInstruments } from './mainData.json';

import styles from './App.module.css';

const COMPANY_ID = 'Virgin Media';

function App(): JSX.Element {
  return (
    <div className={styles.app}>
      <MainContainer
        companyId={COMPANY_ID}
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
