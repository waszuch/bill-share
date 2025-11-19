import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const SplitTypeEnum = z.enum(['EQUAL', 'PROPORTIONAL', 'CUSTOM']);

export const expenseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        amount: z.number().positive(),
        description: z.string().min(1).max(200),
        paidBy: z.string(),
        splitType: SplitTypeEnum,
        splits: z
          .array(
            z.object({
              userId: z.string(),
              amount: z.number().nonnegative(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          participants: true,
        },
      });

      if (!room) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Room not found',
        });
      }

      const isParticipant = room.participants.some(
        (p) => p.userId === ctx.userId
      );

      if (!isParticipant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a participant in this room',
        });
      }

      const paidByIsParticipant = room.participants.some(
        (p) => p.userId === input.paidBy
      );

      if (!paidByIsParticipant) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payer must be a participant in the room',
        });
      }

      let splits = input.splits || [];

      if (input.splitType === 'EQUAL') {
        const participantCount = room.participants.length;
        const splitAmount = input.amount / participantCount;
        splits = room.participants.map((p) => ({
          userId: p.userId,
          amount: splitAmount,
        }));
      }

      const totalSplitAmount = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(totalSplitAmount - input.amount) > 0.01) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Split amounts must sum to the total expense amount',
        });
      }

      const expense = await ctx.db.expense.create({
        data: {
          roomId: input.roomId,
          amount: input.amount,
          description: input.description,
          paidBy: input.paidBy,
          splitType: input.splitType,
          splits: {
            create: splits.map((s) => ({
              userId: s.userId,
              amount: s.amount,
            })),
          },
        },
        include: {
          splits: true,
        },
      });

      return expense;
    }),

  list: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          participants: true,
        },
      });

      if (!room) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Room not found',
        });
      }

      const isParticipant = room.participants.some(
        (p) => p.userId === ctx.userId
      );

      if (!isParticipant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a participant in this room',
        });
      }

      const expenses = await ctx.db.expense.findMany({
        where: { roomId: input.roomId },
        include: {
          splits: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return expenses;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.findUnique({
        where: { id: input.id },
        include: {
          room: {
            include: {
              participants: true,
            },
          },
        },
      });

      if (!expense) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Expense not found',
        });
      }

      const isParticipant = expense.room.participants.some(
        (p) => p.userId === ctx.userId
      );

      if (!isParticipant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a participant in this room',
        });
      }

      if (expense.paidBy !== ctx.userId && expense.room.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the payer or room owner can delete this expense',
        });
      }

      await ctx.db.expense.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

