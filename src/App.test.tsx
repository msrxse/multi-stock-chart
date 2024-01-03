import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders 4 lines correctly', () => {
  render(<App />);

  expect(screen.getAllByRole('img')).toHaveLength(4);
});
