import { createApp } from './app.js';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';
import { smsReady } from './lib/sms.js';
import { runOverdueCheckInSweep } from './lib/safety-sweep.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`\n  Travesía Cameroon API  ->  http://localhost:${config.port}/api`);
  console.log(`  env: ${config.env}`);
  console.log(`  weather: ${config.openWeatherKey ? 'configured' : 'NOT configured'}`);
  console.log(
    `  images:  ${config.cloudinary.cloudName ? 'configured' : 'NOT configured'}`
  );
  console.log(`  sms:     ${smsReady() ? 'configured' : 'NOT configured'}\n`);
});

// Safety check-in alerts: this process stays up on Railway, so an in-process
// interval is enough -- no separate cron/worker needed.
const sweepInterval = setInterval(() => {
  runOverdueCheckInSweep().catch((err) => console.error('[safety-sweep] sweep failed:', err));
}, config.safetySweepIntervalMs);
sweepInterval.unref();

const shutdown = async (signal) => {
  console.log(`\n${signal} received — closing down.`);
  clearInterval(sweepInterval);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Do not hang forever if a socket refuses to close.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
