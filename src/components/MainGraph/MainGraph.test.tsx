import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MainGraph from './MainGraph';
import { AppChartContext } from '../../components/MainGraph/utils/context';
import { dates, series, optionsInstruments } from '../../mainData.json';

const toBeRendered = () => {
  const COMPANY_ID = 'Virgin Media';
  const companyId = COMPANY_ID;
  const width = 1000;
  const height = 500;
  const dataset = { dates, series };
  const handleSelectSeries = jest.fn();

  const { container } = render(
    <AppChartContext.Provider value={{ companyId, width, height, dataset, optionsInstruments, handleSelectSeries }}>
      <MainGraph />
    </AppChartContext.Provider>,
  );

  return { container };
};

test('renders 4 lines correctly', () => {
  toBeRendered();

  expect(screen.getAllByRole('img')).toHaveLength(4);
});

test('renders both yAxis and xAxis ticks', () => {
  const { container } = toBeRendered();

  expect(container.getElementsByClassName('tick').length).toBe(32);
});

test('renders legend items', () => {
  toBeRendered();

  expect(screen.getAllByTestId(/^legendItem_/)).toHaveLength(25);
});
