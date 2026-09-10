import { prisma } from '@/lib/db';

export const LOG_RETENTION_DAYS = 90;

export async function purgeOldGenerationLogs(now = new Date()): Promise<{ deleted: number }> {
  const threshold = new Date(now.getTime() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await prisma.aIGenerationLog.deleteMany({
    where: { createdAt: { lt: threshold } },
  });

  return { deleted: count };
}
