'use client';

import { useState } from 'react';
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
import { useMutation } from '@tanstack/react-query';

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const trpc = useTRPC();
  
  const createRoom = useMutation({
    ...trpc.room.create.mutationOptions(),
    onSuccess: (data) => {
      setName('');
      setOpen(false);
      toast.success('Room created successfully', {
        description: `Room code: ${data.code}`,
      });
    },
    onError: (error) => {
      toast.error('Failed to create room', {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createRoom.mutate({ name: name.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Room</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Weekend Trip"
              disabled={createRoom.isPending}
              maxLength={100}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createRoom.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRoom.isPending || !name.trim()}>
              {createRoom.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

