import { render, screen } from '@testing-library/react';
import { RoomCard } from '../RoomCard';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('RoomCard Component', () => {
  const mockRoom = {
    id: '1',
    name: 'Weekend Trip',
    code: 'ABC123',
    owner: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    participants: [{ id: '1' }, { id: '2' }, { id: '3' }],
    _count: {
      expenses: 5,
    },
  };

  it('renders room information correctly', () => {
    render(<RoomCard room={mockRoom} isOwner={false} />);
    
    expect(screen.getByText('Weekend Trip')).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays owner badge when user is owner', () => {
    render(<RoomCard room={mockRoom} isOwner={true} />);
    
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('does not display owner badge when user is not owner', () => {
    render(<RoomCard room={mockRoom} isOwner={false} />);
    
    expect(screen.queryByText('Owner')).not.toBeInTheDocument();
  });

  it('renders View Room button with correct link', () => {
    render(<RoomCard room={mockRoom} isOwner={false} />);
    
    const viewButton = screen.getByText('View Room');
    expect(viewButton).toBeInTheDocument();
    expect(viewButton.closest('a')).toHaveAttribute('href', '/room/ABC123');
  });

  it('displays correct participant count', () => {
    const roomWithOneParticipant = {
      ...mockRoom,
      participants: [{ id: '1' }],
    };
    
    render(<RoomCard room={roomWithOneParticipant} isOwner={false} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays zero expenses when no expenses exist', () => {
    const roomWithNoExpenses = {
      ...mockRoom,
      _count: { expenses: 0 },
    };
    
    render(<RoomCard room={roomWithNoExpenses} isOwner={false} />);
    
    const expensesLabel = screen.getByText('Expenses');
    const expensesValue = expensesLabel.parentElement?.querySelector('.font-semibold');
    expect(expensesValue).toHaveTextContent('0');
  });
});



