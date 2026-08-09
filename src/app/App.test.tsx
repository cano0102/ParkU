import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renderiza la app en la ruta inicial sin lanzar errores', async () => {
    render(<App />);

    const matches = await screen.findAllByText(/ParkU/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});
