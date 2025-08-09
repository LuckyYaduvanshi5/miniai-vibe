import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import prisma from '@/lib/db';
export const appRouter = createTRPCRouter({
  createAI: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  sitePlanList: baseProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit ?? 20;
      const plans = await prisma.sitePlan.findMany({ orderBy: { id: 'desc' }, take: limit });
      return plans;
    }),
  sitePlanLatest: baseProcedure
    .query(async () => {
      return prisma.sitePlan.findFirst({ orderBy: { id: 'desc' } });
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;