'use client';

import { useState } from 'react';
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
  const [splitType, setSplitType] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createExpenseMutation = useMutation({
    ...trpc.expense.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.expense.list.queryKey({ roomId }));
      queryClient.invalidateQueries(trpc.room.list.queryKey());
      setOpen(false);
      setAmount('');
      setDescription('');
      setSplitType('EQUAL');
    },
    onError: (error) => {
      toast.error('Failed to add expense', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    createExpenseMutation.mutate({
      roomId,
      amount: amountNum,
      description,
      paidBy,
      splitType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>
      <DialogContent>
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
            <Label htmlFor="splitType">Split Type</Label>
            <select
              id="splitType"
              value={splitType}
              onChange={(e) => setSplitType(e.target.value as 'EQUAL' | 'CUSTOM')}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="EQUAL">Split Equally</option>
              <option value="CUSTOM" disabled>
                Custom Split (Coming Soon)
              </option>
            </select>
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

