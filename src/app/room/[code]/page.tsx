'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useTRPC } from '@/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { BalancesSummary } from '@/components/expenses/BalancesSummary';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const code = params.code as string;

  const { data: rooms } = useQuery({
    ...trpc.room.list.queryOptions(),
    enabled: !!user,
  });

  const room = rooms?.find((r) => r.code === code);

  const { data: roomDetails, isLoading: roomLoading } = useQuery({
    ...trpc.room.getById.queryOptions({ id: room?.id || '' }),
    enabled: !!room?.id,
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    ...trpc.expense.list.queryOptions({ roomId: room?.id || '' }),
    enabled: !!room?.id,
  });

  const deleteRoomMutation = useMutation({
    ...trpc.room.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.room.list.queryKey());
      router.push('/');
    },
  });

  const handleDeleteRoom = () => {
    if (room && confirm('Are you sure you want to delete this room?')) {
      deleteRoomMutation.mutate({ id: room.id });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  if (authLoading || roomLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Loading...</div>
      </main>
    );
  }

  if (!room || !roomDetails) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Room not found
          </h2>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </main>
    );
  }

  const isOwner = room.ownerId === user?.id;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/')}>
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
                {code}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                Copy Code
              </Button>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteRoom}
                  disabled={deleteRoomMutation.isPending}
                >
                  Delete Room
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
              <AddExpenseDialog roomId={room.id} participants={roomDetails.participants} />
            </div>

            {expensesLoading ? (
              <div className="text-center py-12 text-gray-400">
                Loading expenses...
              </div>
            ) : expenses && expenses.length > 0 ? (
              <ExpenseList
                expenses={expenses}
                participants={roomDetails.participants}
                currentUserId={user?.id || ''}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No expenses yet. Add one to get started.
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roomDetails.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {participant.user.name?.[0]?.toUpperCase() || 
                             participant.user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {participant.user.name || participant.user.email}
                          </p>
                          {participant.userId === room.ownerId && (
                            <p className="text-xs text-gray-500">Owner</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {expenses && expenses.length > 0 && (
              <BalancesSummary
                expenses={expenses}
                participants={roomDetails.participants}
                currentUserId={user?.id || ''}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

