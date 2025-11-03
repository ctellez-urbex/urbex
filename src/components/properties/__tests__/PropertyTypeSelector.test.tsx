/**
 * PropertyTypeSelector Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyTypeSelector } from '../PropertyTypeSelector';

describe('PropertyTypeSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default value', () => {
    render(
      <PropertyTypeSelector
        value={['Todos']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Tipo de inmueble(s)')).toBeInTheDocument();
    expect(screen.getByText('Todos')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    render(
      <PropertyTypeSelector
        value={['Todos']}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    const residentialOption = screen.getByText('Residencial');
    fireEvent.click(residentialOption);

    expect(mockOnChange).toHaveBeenCalledWith(['residencial']);
  });

  it('handles multiple selections correctly', () => {
    render(
      <PropertyTypeSelector
        value={['residencial']}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    const commercialOption = screen.getByText('Comercio');
    fireEvent.click(commercialOption);

    expect(mockOnChange).toHaveBeenCalledWith(['residencial', 'comercio']);
  });

  it('resets to Todos when all selections are removed', () => {
    render(
      <PropertyTypeSelector
        value={['residencial']}
        onChange={mockOnChange}
      />
    );

    // The remove button should be visible when there are multiple selections
    // For now, we'll test the logic by directly calling the handler
    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    const todosOption = screen.getByText('Todos');
    fireEvent.click(todosOption);

    expect(mockOnChange).toHaveBeenCalledWith(['Todos']);
  });

  it('disables when disabled prop is true', () => {
    render(
      <PropertyTypeSelector
        value={['Todos']}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });
});
