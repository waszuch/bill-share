'use client';

import { useState, useMemo } from 'react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
  roomId: string;
  participants: Participant[];
};

export function AddExpenseDialog({ roomId, participants }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState(participants[0]?.userId || '');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set(participants.map((p) => p.userId))
  );

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createExpenseMutation = useMutation({
    ...trpc.expense.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.expense.pathKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.room.pathKey(),
      });
      setOpen(false);
      setAmount('');
      setDescription('');
      setSelectedParticipants(new Set(participants.map((p) => p.userId)));
    },
    onError: (error) => {
      toast.error('Failed to add expense', {
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

    createExpenseMutation.mutate({
      roomId,
      amount: amountNum,
      description,
      paidBy,
      splitType: 'EQUAL',
      splits,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createExpenseMutation.isPending}>
              {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

