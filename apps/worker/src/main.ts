import { PrismaClient } from '@prisma/client';
import { dispatchOutbox } from '@autonova/outbox';

const prisma = new PrismaClient();
const INTERVAL_MS = Number(process.env.OUTBOX_POLL_MS ?? 15_000);

async function tick() {
  try {
    const result = await dispatchOutbox(prisma);
    if (result.processed > 0) console.log(`[worker] dispatched ${result.processed} outbox event(s)`);
  } catch (error) {
    // A failed dispatch leaves events PENDING, so the next tick retries them.
    console.error('[worker] dispatch failed', error);
  }
}

async function shutdown(signal: string) {
  console.log(`[worker] ${signal} received, shutting down`);
  await prisma.$disconnect();
  process.exit(0);
}

async function main() {
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  await tick();
  setInterval(() => void tick(), INTERVAL_MS);
  console.log(`[worker] outbox worker polling every ${INTERVAL_MS}ms`);
}

void main();
