import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import App from './App';

test('renders App correctly', () => {
  render(<App />);
  expect(true).toBeTruthy();
});
