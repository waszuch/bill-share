import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import { prisma } from '@/db/prisma';

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    headers: opts.headers,
    db: prisma,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

