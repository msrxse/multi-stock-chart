import MainContainer from './components/MainGraph/MainContainer';
import { dates, series, options, optionsDefault, optionsInstruments } from './mainData.json';
import styles from './App.module.css';

const COMPANY_ID = 'Virgin Media';

/**
 * @param companyId -
 * @param pricing -
 * @param options -
 * @param optionsDefault -
 * @param optionsInstruments -
 * @param handleSelectChartSeries -
 */
function App(): JSX.Element {
  return (
    <div className={styles.app}>
      <MainContainer
        companyId={COMPANY_ID}
        pricing={{ dates, series }}
        options={options}
        optionsDefault={optionsDefault}
        optionsInstruments={optionsInstruments}
        handleSelectChartSeries={() => {}}
      />
    </div>
  );
}

export default App;
