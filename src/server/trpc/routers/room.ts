import { z } from 'zod';
import { nanoid } from 'nanoid';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const roomRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const code = nanoid(8);

      const room = await ctx.db.room.create({
        data: {
          name: input.name,
          code,
          ownerId: ctx.userId,
          participants: {
            create: {
              userId: ctx.userId,
            },
          },
        },
        include: {
          owner: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      return room;
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const rooms = await ctx.db.room.findMany({
      where: {
        OR: [
          { ownerId: ctx.userId },
          {
            participants: {
              some: {
                userId: ctx.userId,
              },
            },
          },
        ],
      },
      include: {
        owner: true,
        participants: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            expenses: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return rooms;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.id },
        include: {
          owner: true,
          participants: {
            include: {
              user: true,
            },
          },
          expenses: {
            include: {
              splits: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
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

      return room;
    }),

  join: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { code: input.code },
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

      const alreadyJoined = room.participants.some(
        (p) => p.userId === ctx.userId
      );

      if (alreadyJoined) {
        return room;
      }

      const updatedRoom = await ctx.db.room.update({
        where: { id: room.id },
        data: {
          participants: {
            create: {
              userId: ctx.userId,
            },
          },
        },
        include: {
          owner: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      return updatedRoom;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.id },
      });

      if (!room) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Room not found',
        });
      }

      if (room.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the owner can delete this room',
        });
      }

      await ctx.db.room.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});

