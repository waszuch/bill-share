'use client';

import { useState } from 'react';
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
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';

export function JoinRoomDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const trpc = useTRPC();
  
  const joinRoom = useMutation({
    ...trpc.room.join.mutationOptions(),
    onSuccess: () => {
      setCode('');
      setOpen(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    joinRoom.mutate({ code: code.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Join Room</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Room Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 8-character code"
              disabled={joinRoom.isPending}
              maxLength={8}
            />
            {joinRoom.error && (
              <p className="text-sm text-red-600">
                {joinRoom.error.message || 'Failed to join room'}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={joinRoom.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={joinRoom.isPending || !code.trim()}>
              {joinRoom.isPending ? 'Joining...' : 'Join'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

