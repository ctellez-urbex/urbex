/**
 * NumberRangeInput Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { NumberRangeInput } from '../NumberRangeInput';

describe('NumberRangeInput', () => {
  const mockOnMinChange = jest.fn();
  const mockOnMaxChange = jest.fn();

  beforeEach(() => {
    mockOnMinChange.mockClear();
    mockOnMaxChange.mockClear();
  });

  it('renders with default values', () => {
    render(
      <NumberRangeInput
        label="Test Range"
        minValue=""
        maxValue=""
        onMinChange={mockOnMinChange}
        onMaxChange={mockOnMaxChange}
      />
    );

    expect(screen.getByText('Test Range')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mínimo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Máximo')).toBeInTheDocument();
  });

  it('calls onMinChange when min input changes', () => {
    render(
      <NumberRangeInput
        label="Test Range"
        minValue=""
        maxValue=""
        onMinChange={mockOnMinChange}
        onMaxChange={mockOnMaxChange}
      />
    );

    const minInput = screen.getByPlaceholderText('Mínimo');
    fireEvent.change(minInput, { target: { value: '100' } });

    expect(mockOnMinChange).toHaveBeenCalledWith(100);
  });

  it('calls onMaxChange when max input changes', () => {
    render(
      <NumberRangeInput
        label="Test Range"
        minValue=""
        maxValue=""
        onMinChange={mockOnMinChange}
        onMaxChange={mockOnMaxChange}
      />
    );

    const maxInput = screen.getByPlaceholderText('Máximo');
    fireEvent.change(maxInput, { target: { value: '500' } });

    expect(mockOnMaxChange).toHaveBeenCalledWith(500);
  });

  it('enforces min and max constraints', () => {
    render(
      <NumberRangeInput
        label="Test Range"
        minValue=""
        maxValue=""
        onMinChange={mockOnMinChange}
        onMaxChange={mockOnMaxChange}
        min={0}
        max={1000}
      />
    );

    const minInput = screen.getByPlaceholderText('Mínimo');
    fireEvent.change(minInput, { target: { value: '-50' } });

    expect(mockOnMinChange).toHaveBeenCalledWith(0);

    const maxInput = screen.getByPlaceholderText('Máximo');
    fireEvent.change(maxInput, { target: { value: '1500' } });

    expect(mockOnMaxChange).toHaveBeenCalledWith(1000);
  });

  it('handles empty values correctly', () => {
    render(
      <NumberRangeInput
        label="Test Range"
        minValue="100"
        maxValue="500"
        onMinChange={mockOnMinChange}
        onMaxChange={mockOnMaxChange}
      />
    );

    const minInput = screen.getByPlaceholderText('Mínimo');
    fireEvent.change(minInput, { target: { value: '' } });

    // The component should call onMinChange with empty string when input is cleared
    expect(mockOnMinChange).toHaveBeenCalledWith('');
  });

  it('disables inputs when disabled prop is true', () => {
    render(
      <NumberRangeInput
        label="Test Range"
        minValue=""
        maxValue=""
        onMinChange={mockOnMinChange}
        onMaxChange={mockOnMaxChange}
        disabled={true}
      />
    );

    const minInput = screen.getByPlaceholderText('Mínimo');
    const maxInput = screen.getByPlaceholderText('Máximo');

    expect(minInput).toBeDisabled();
    expect(maxInput).toBeDisabled();
  });
});
