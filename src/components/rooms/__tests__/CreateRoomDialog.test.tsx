import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateRoomDialog } from '../CreateRoomDialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockMutate = jest.fn();
const mockUseTRPC = {
  room: {
    create: {
      mutationOptions: () => ({
        mutationFn: jest.fn(),
      }),
    },
    pathKey: () => ['room'],
  },
};

jest.mock('@/trpc/client', () => ({
  useTRPC: () => mockUseTRPC,
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: ({ onSuccess, onError }: any) => ({
    mutate: (data: any) => {
      mockMutate(data);
      if (data.name) {
        onSuccess?.({ code: 'TEST123', ...data });
      }
    },
    isPending: false,
  }),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CreateRoomDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create room button', () => {
    render(<CreateRoomDialog />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Create Room')).toBeInTheDocument();
  });

  it('opens dialog when create button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateRoomDialog />, { wrapper: createWrapper() });
    
    await user.click(screen.getByText('Create Room'));
    
    await waitFor(() => {
      expect(screen.getByText('Create a new room')).toBeInTheDocument();
    });
  });

  it('renders form fields when dialog is open', async () => {
    const user = userEvent.setup();
    render(<CreateRoomDialog />, { wrapper: createWrapper() });
    
    await user.click(screen.getByText('Create Room'));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Room Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Weekend Trip')).toBeInTheDocument();
    });
  });

  it('submit button is disabled when room name is empty', async () => {
    const user = userEvent.setup();
    render(<CreateRoomDialog />, { wrapper: createWrapper() });
    
    await user.click(screen.getByText('Create Room'));
    
    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create/i });
      expect(createButton).toBeDisabled();
    });
  });

  it('allows typing in room name input', async () => {
    const user = userEvent.setup();
    render(<CreateRoomDialog />, { wrapper: createWrapper() });
    
    await user.click(screen.getByText('Create Room'));
    
    const input = await screen.findByLabelText('Room Name');
    await user.type(input, 'My Test Room');
    
    expect(input).toHaveValue('My Test Room');
  });

  it('closes dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateRoomDialog />, { wrapper: createWrapper() });
    
    await user.click(screen.getByText('Create Room'));
    await waitFor(() => {
      expect(screen.getByText('Create a new room')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Create a new room')).not.toBeInTheDocument();
    });
  });
});


