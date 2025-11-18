'use client';

import { useAuth } from './providers';
import { createClient } from '@/lib/supabase/client';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog';
import { JoinRoomDialog } from '@/components/rooms/JoinRoomDialog';
import { RoomCard } from '@/components/rooms/RoomCard';

export default function HomePage() {
  const { user, loading } = useAuth();
  const supabase = createClient();
  const trpc = useTRPC();
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    ...trpc.room.list.queryOptions(),
    enabled: !!user,
  });

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">BillShare</h1>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button variant="ghost" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={signInWithGoogle}>Sign In with Google</Button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Rooms</h2>
              <div className="flex gap-2">
                <JoinRoomDialog />
                <CreateRoomDialog />
              </div>
            </div>

            {roomsLoading ? (
              <div className="text-center py-12 text-gray-400">Loading rooms...</div>
            ) : rooms && rooms.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isOwner={room.ownerId === user?.id}
            />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                No rooms yet. Create or join one to get started.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Split bills with friends
            </h2>
            <p className="text-gray-600 mb-8">
              Create a room, add expenses, and see who owes what.
            </p>
            <Button size="lg" onClick={signInWithGoogle}>
              Get Started
            </Button>
          </div>
        )}
        </div>
      </main>
  );
}
