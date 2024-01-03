import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { dates, series } from '../../../mainData.json';
import GraphContainer from './GraphContainer';

const props = {
  width: 1000,
  height: 420,
  companyId: 'Virgin Media',
  selectedDates: dates,
  seriesList: series,
  animateTransition: false,
  currentHoveredSerieIndex: -1,
};

test('renders 4 lines correctly', () => {
  render(<GraphContainer {...props} />);

  expect(screen.getAllByRole('img')).toHaveLength(4);
});

test('renders bottomAxes and leftAxes correctly with all labels', () => {
  const { container } = render(<GraphContainer {...props} />);
  expect(container.getElementsByClassName('tick').length).toBe(21);
});
