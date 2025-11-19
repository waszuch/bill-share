'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type Expense = {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
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
  expense: Expense;
  participants: Participant[];
  roomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditExpenseDialog({
  expense,
  participants,
  roomId,
  open,
  onOpenChange,
}: Props) {
  const [amount, setAmount] = useState(expense.amount.toString());
  const [description, setDescription] = useState(expense.description);
  const [paidBy, setPaidBy] = useState(expense.paidBy);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set(expense.splits.map((s) => s.userId))
  );

  useEffect(() => {
    if (open) {
      setAmount(expense.amount.toString());
      setDescription(expense.description);
      setPaidBy(expense.paidBy);
      setSelectedParticipants(new Set(expense.splits.map((s) => s.userId)));
    }
  }, [expense, open]);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateExpenseMutation = useMutation({
    ...trpc.expense.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.expense.list.queryKey({ roomId }),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.room.list.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.room.getById.queryKey({ id: roomId }),
      });
      toast.success('Expense updated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to update expense', {
        description: error.message,
      });
    },
  });

  const splitAmount = useMemo(() => {
    if (!amount || selectedParticipants.size === 0) return 0;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return 0;
    return amountNum / selectedParticipants.size;
  }, [amount, selectedParticipants.size]);

  const handleToggleParticipant = (userId: string) => {
    const newSet = new Set(selectedParticipants);
    if (newSet.has(userId)) {
      if (newSet.size > 1) {
        newSet.delete(userId);
      } else {
        toast.error('At least one participant must be selected');
        return;
      }
    } else {
      newSet.add(userId);
    }
    setSelectedParticipants(newSet);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (selectedParticipants.size === 0) {
      toast.error('Please select at least one participant');
      return;
    }

    const selectedArray = Array.from(selectedParticipants);
    const splitAmountPerPerson = amountNum / selectedArray.length;
    const splits = selectedArray.map((userId) => ({
      userId,
      amount: splitAmountPerPerson,
    }));

    updateExpenseMutation.mutate({
      id: expense.id,
      amount: amountNum,
      description,
      paidBy,
      splitType: 'EQUAL',
      splits,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dinner, groceries, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="paidBy">Paid By</Label>
            <select
              id="paidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              {participants.map((p) => (
                <option key={p.userId} value={p.userId}>
                  {p.user.name || p.user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Split Between</Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {participants.map((participant) => {
                const isSelected = selectedParticipants.has(participant.userId);
                return (
                  <div
                    key={participant.userId}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`participant-${participant.userId}`}
                      checked={isSelected}
                      onCheckedChange={() =>
                        handleToggleParticipant(participant.userId)
                      }
                    />
                    <Label
                      htmlFor={`participant-${participant.userId}`}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      {participant.user.name || participant.user.email}
                    </Label>
                    {isSelected && amount && (
                      <span className="text-sm text-gray-500">
                        {splitAmount.toFixed(2)} zł
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {amount && selectedParticipants.size > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {splitAmount.toFixed(2)} zł per person
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateExpenseMutation.isPending}>
              {updateExpenseMutation.isPending ? 'Updating...' : 'Update Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

