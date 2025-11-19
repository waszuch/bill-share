'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeEvent = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  old: Record<string, any>;
  new: Record<string, any>;
};

type UseRoomRealtimeOptions = {
  roomId: string;
  enabled?: boolean;
  currentUserId?: string;
};

export function useRoomRealtime({
  roomId,
  enabled = true,
  currentUserId,
}: UseRoomRealtimeOptions) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Expense',
          filter: `roomId=eq.${roomId}`,
        },
        (payload: RealtimeEvent) => {
          if (payload.eventType === 'INSERT') {
            queryClient.invalidateQueries({
              queryKey: trpc.expense.list.queryKey({ roomId }),
            });
            queryClient.invalidateQueries({
              queryKey: trpc.room.list.queryKey(),
            });

            toast.success('New expense added', {
              description: payload.new.description,
            });
          } else if (payload.eventType === 'DELETE') {
            queryClient.invalidateQueries({
              queryKey: trpc.expense.list.queryKey({ roomId }),
            });
            queryClient.invalidateQueries({
              queryKey: trpc.room.list.queryKey(),
            });

            toast.info('Expense deleted', {
              description: payload.old.description,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Participant',
          filter: `roomId=eq.${roomId}`,
        },
        (payload: RealtimeEvent) => {
          if (payload.new.userId !== currentUserId) {
            queryClient.invalidateQueries({
              queryKey: trpc.room.getById.queryKey({ id: roomId }),
            });
            queryClient.invalidateQueries({
              queryKey: trpc.room.list.queryKey(),
            });

            toast.info('New participant joined');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'Participant',
          filter: `roomId=eq.${roomId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: trpc.room.getById.queryKey({ id: roomId }),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.room.list.queryKey(),
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Room',
          filter: `id=eq.${roomId}`,
        },
        (payload: RealtimeEvent) => {
          queryClient.invalidateQueries({
            queryKey: trpc.room.getById.queryKey({ id: roomId }),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.room.list.queryKey(),
          });

          if (payload.new.name !== payload.old.name) {
            toast.info('Room updated', {
              description: `Room renamed to "${payload.new.name}"`,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to realtime updates for room: ${roomId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error');
          toast.error('Failed to connect to realtime updates');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId, enabled, currentUserId, supabase, queryClient, trpc]);

  return {
    isSubscribed: channelRef.current !== null,
  };
}

