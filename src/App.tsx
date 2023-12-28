import MainGraph from './components/MainGraph/MainGraph';
import { dates, series, optionsInstruments } from './mainData.json';
import styles from './App.module.css';

const COMPANY_ID = 'Virgin Media';

function App(): JSX.Element {
  return (
    <div className={styles.app}>
      <MainGraph
        companyId={COMPANY_ID}
        width={1000}
        height={500}
        dataset={{ dates, series }}
        optionsInstruments={optionsInstruments}
        handleSelectSeries={(instrument) => console.log(instrument.trancheId)}
      />
    </div>
  );
}

export default App;
