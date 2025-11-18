'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    code: string;
    owner: {
      name: string | null;
      email: string;
    };
    participants: Array<{ id: string }>;
    _count: {
      expenses: number;
    };
  };
  isOwner: boolean;
}

export function RoomCard({ room, isOwner }: RoomCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{room.name}</span>
          {isOwner && (
            <span className="text-xs font-normal text-gray-500">Owner</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Code</p>
            <p className="font-mono font-semibold">{room.code}</p>
          </div>
          <div>
            <p className="text-gray-500">Participants</p>
            <p className="font-semibold">{room.participants.length}</p>
          </div>
          <div>
            <p className="text-gray-500">Expenses</p>
            <p className="font-semibold">{room._count.expenses}</p>
          </div>
        </div>
        <Link href={`/room/${room.id}`}>
          <Button className="w-full">View Room</Button>
        </Link>
      </CardContent>
    </Card>
  );
}


