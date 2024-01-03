import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { scaleLinear, scaleUtc } from 'd3-scale';
import { dates, series } from '../../../mainData.json';
import Graph from './Graph';

const props = {
  keyVal: 'virgin-media',
  animateTransition: false,
  series: [series[0]], // just 1 line
  selectedDates: dates,
  width: 1000,
  height: 420,
  x: 0,
  y: 0,
  currentHoveredSerieIndex: -1,
};
const timeDomain = [1606176000000, 1614038400000];
const valueDomain = [3.636, 4.565];
const xScale = scaleUtc().range([0, props.width]).domain(timeDomain);
const yScale = scaleLinear().range([props.height, 0]).domain(valueDomain).nice();

test('renders 4 lines correctly', () => {
  render(<Graph {...props} xScale={xScale} yScale={yScale} />);

  expect(screen.getAllByRole('img')).toHaveLength(1);
});

test('renders 1 bottom axis with all labels', () => {
  const { container } = render(<Graph {...props} xScale={xScale} yScale={yScale} />);
  expect(container.getElementsByClassName('tick').length).toBe(13);
});
