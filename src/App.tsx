import MainGraph from './components/MainGraph/MainGraph';
import { dates, series, optionsInstruments } from './mainData.json';
import { AppChartContext } from './components/MainGraph/utils/context';
import { Instrument } from './components/MainGraph/utils/types';

import styles from './App.module.css';

const COMPANY_ID = 'Virgin Media';

const companyId = COMPANY_ID;
const width = 1000;
const height = 500;
const dataset = { dates, series };
const handleSelectSeries = (instrument: Instrument) => console.log(instrument.trancheId);

function App(): JSX.Element {
  return (
    <AppChartContext.Provider value={{ companyId, width, height, dataset, optionsInstruments, handleSelectSeries }}>
      <div className={styles.app}>
        <MainGraph />
      </div>
    </AppChartContext.Provider>
  );
}

export default App;
