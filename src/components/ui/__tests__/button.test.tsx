import { render, screen } from '@testing-library/react';
import { Button } from '../button';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByText('Delete')).toHaveClass('bg-destructive');
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toHaveClass('border');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByText('Disabled Button')).toBeDisabled();
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('h-8');
    
    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('h-10');
  });
});





