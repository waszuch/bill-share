'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export default function HomePage() {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(
    trpc.health.queryOptions({ ping: 'test' })
  );

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">BillShare</h1>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">tRPC Health Check</h2>
          
          {isLoading && <p className="text-gray-500">Loading...</p>}
          
          {error && (
            <p className="text-red-600">Error: {error.message}</p>
          )}
          
          {data && (
            <div className="space-y-2">
              <p>Status: <span className="font-mono">{data.status}</span></p>
              <p>Timestamp: <span className="font-mono text-sm">{data.timestamp}</span></p>
              {data.echo && <p>Echo: <span className="font-mono">{data.echo}</span></p>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
