import { render, screen } from '@testing-library/react';
import App from './App';

test('renders frontend heading', () => {
  render(<App />);
  const linkElement = screen.getByText(/react frontend/i);
  expect(linkElement).toBeInTheDocument();
});
