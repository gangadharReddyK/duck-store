/// <reference types="vitest" />
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DuckForm } from './DuckForm';

// Mock function to capture form submission
const mockOnSubmit = vi.fn();

describe('DuckForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('color and size are disabled in edit mode', () => {
    render(<DuckForm onSubmit={mockOnSubmit} isEditing />);

    const colorSelect = screen.getByLabelText(/color:/i) as HTMLSelectElement;
    const sizeSelect = screen.getByLabelText(/size:/i) as HTMLSelectElement;

    expect(colorSelect.disabled).toBe(true);
    expect(sizeSelect.disabled).toBe(true);
  });

  test('color and size are enabled in add mode', () => {
    render(<DuckForm onSubmit={mockOnSubmit} />);

    const colorSelect = screen.getByLabelText(/color:/i) as HTMLSelectElement;
    const sizeSelect = screen.getByLabelText(/size:/i) as HTMLSelectElement;

    expect(colorSelect.disabled).toBe(false);
    expect(sizeSelect.disabled).toBe(false);
  });

  test('submits form with valid data', () => {
    render(<DuckForm onSubmit={mockOnSubmit} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/color:/i), { target: { value: 'Red' } });
    fireEvent.change(screen.getByLabelText(/size:/i), { target: { value: 'Large' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '10.50' } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '5' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /add duck/i }));

    // Verify submission
    expect(mockOnSubmit).toHaveBeenCalledWith({
      color: 'Red',
      size: 'Large',
      price: 10.50,
      quantity: 5
    });
  });

  test('rejects empty fields', () => {
    render(<DuckForm onSubmit={mockOnSubmit} />);

    // Try to submit without filling anything
    fireEvent.click(screen.getByRole('button', { name: /add duck/i }));

    // Should not submit
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('rejects invalid price', () => {
    render(<DuckForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/color:/i), { target: { value: 'Red' } });
    fireEvent.change(screen.getByLabelText(/size:/i), { target: { value: 'Large' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '-5' } }); // Negative price
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '5' } });

    fireEvent.click(screen.getByRole('button', { name: /add duck/i }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('rejects non-whole quantity', () => {
    render(<DuckForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/color:/i), { target: { value: 'Red' } });
    fireEvent.change(screen.getByLabelText(/size:/i), { target: { value: 'Large' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '10.50' } });
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '5.5' } }); // Not whole

    fireEvent.click(screen.getByRole('button', { name: /add duck/i }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});