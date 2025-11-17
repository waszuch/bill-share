import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const appRouter = createTRPCRouter({
  health: publicProcedure
    .input(z.object({ ping: z.string() }).optional())
    .query(({ input }) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        echo: input?.ping ?? null,
      };
    }),
});

export type AppRouter = typeof appRouter;

