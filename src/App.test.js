import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders app layout with global background', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const bgElement = document.querySelector('.global-background');
  expect(bgElement).toBeInTheDocument();
});
