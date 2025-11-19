'use client';

import { useState } from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditExpenseDialog } from './EditExpenseDialog';

type Expense = {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
  splitType: string;
  createdAt: Date | string;
  splits: {
    id: string;
    userId: string;
    amount: number;
  }[];
};

type Participant = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type Props = {
  expenses: Expense[];
  participants: Participant[];
  currentUserId: string;
  roomId: string;
};

export function ExpenseList({
  expenses,
  participants,
  currentUserId,
  roomId,
}: Props) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteExpenseMutation = useMutation({
    ...trpc.expense.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.expense.pathKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.room.pathKey(),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete expense', {
        description: error.message,
      });
    },
  });

  const getUserName = (userId: string) => {
    const participant = participants.find((p) => p.userId === userId);
    return participant?.user.name || participant?.user.email || 'Unknown';
  };

  const handleDelete = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpenseMutation.mutate({ id: expenseId });
    }
  };

  return (
    <>
      <div className="space-y-3">
        {expenses.map((expense) => {
          const canEdit = expense.paidBy === currentUserId;

          return (
            <Card key={expense.id}>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900 break-words">
                        {expense.description}
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-500 shrink-0">
                        {expense.splitType.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Paid by {getUserName(expense.paidBy)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(expense.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {expense.amount.toFixed(2)} zł
                    </span>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingExpense(expense)}
                          disabled={deleteExpenseMutation.isPending}
                          className="text-xs sm:text-sm"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                          disabled={deleteExpenseMutation.isPending}
                          className="text-xs sm:text-sm"
                        >
                          {deleteExpenseMutation.isPending ? '...' : 'Delete'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          participants={participants}
          roomId={roomId}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
        />
      )}
    </>
  );
}

