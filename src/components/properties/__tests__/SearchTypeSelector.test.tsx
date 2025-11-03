/**
 * SearchTypeSelector Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { SearchTypeSelector } from '../SearchTypeSelector';

describe('SearchTypeSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default value', () => {
    render(
      <SearchTypeSelector
        value="polygon"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Tipo de búsqueda')).toBeInTheDocument();
    expect(screen.getByText('En un polígono')).toBeInTheDocument();
  });

  it('calls onChange when selection changes', () => {
    render(
      <SearchTypeSelector
        value="polygon"
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    const addressOption = screen.getByText('Por dirección');
    fireEvent.click(addressOption);

    expect(mockOnChange).toHaveBeenCalledWith('address');
  });

  it('disables when disabled prop is true', () => {
    render(
      <SearchTypeSelector
        value="polygon"
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('shows all search type options', () => {
    render(
      <SearchTypeSelector
        value=""
        onChange={mockOnChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.click(select);

    expect(screen.getByText('En un polígono')).toBeInTheDocument();
    expect(screen.getByText('Por dirección')).toBeInTheDocument();
    expect(screen.getByText('Por chip')).toBeInTheDocument();
    expect(screen.getByText('Por matrícula inmobiliaria')).toBeInTheDocument();
    expect(screen.getByText('Nombre de la copropiedad')).toBeInTheDocument();
  });
});
