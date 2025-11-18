import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

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

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
    });
    return user;
  }),
});

export type AppRouter = typeof appRouter;

