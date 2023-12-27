import MainContainer from './components/MainGraph/MainContainer';
import { dates, series, optionsInstruments } from './mainData.json';
import styles from './App.module.css';

const COMPANY_ID = 'Virgin Media';

/**
 * @param companyId -
 * @param pricing -
 * @param options -
 * @param optionsDefault -
 * @param optionsInstruments -
 * @param handleSelectSeries -
 */
function App(): JSX.Element {
  return (
    <div className={styles.app}>
      <MainContainer
        companyId={COMPANY_ID}
        pricing={{ dates, series }}
        optionsInstruments={optionsInstruments}
        handleSelectSeries={() => console.log('New series clicked and data requested')}
      />
    </div>
  );
}

export default App;
