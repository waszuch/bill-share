'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function JoinRoomDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const joinRoom = useMutation({
    ...trpc.room.join.mutationOptions(),
    onSuccess: async (data) => {
      setCode('');
      setOpen(false);
      
      // Invalidate queries before navigation to ensure fresh data
      await queryClient.invalidateQueries({
        queryKey: trpc.room.list.queryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: trpc.room.getById.queryKey({ id: data.id }),
      });
      
      toast.success('Joined room successfully', {
        description: data.name,
      });
      
      // Small delay to ensure queries are invalidated
      setTimeout(() => {
        router.push(`/room/${data.code}`);
      }, 100);
    },
    onError: (error) => {
      toast.error('Failed to join room', {
        description: error.message,
      });
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

