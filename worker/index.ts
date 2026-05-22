import "dotenv/config";
import { connectDB } from "../src/lib/db";
import { runStreamingHealthJob } from "./jobs/streamingHealth.job";

const DEFAULT_STREAMING_HEALTH_INTERVAL_MS = 30_000;

let streamingHealthRunning = false;
let streamingHealthTimer: NodeJS.Timeout | null = null;

function parseIntervalMs(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

const streamingHealthIntervalMs = parseIntervalMs(
  process.env.STREAMING_HEALTH_INTERVAL_MS,
  DEFAULT_STREAMING_HEALTH_INTERVAL_MS
);

async function safeRunStreamingHealthJob() {
  if (streamingHealthRunning) {
    console.log("[STREAMING HEALTH] job anterior todavía en ejecución, se omite esta vuelta");
    return;
  }

  streamingHealthRunning = true;

  try {
    await runStreamingHealthJob();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";

    console.error("[STREAMING HEALTH ERROR]", message);
  } finally {
    streamingHealthRunning = false;
  }
}

async function startWorker() {
  console.log("[WORKER] Iniciando worker wish.net-TV-core");

  await connectDB();

  console.log("[WORKER] Base de datos conectada");
  console.log(
    `[WORKER] Health streaming cada ${streamingHealthIntervalMs}ms`
  );

  await safeRunStreamingHealthJob();

  streamingHealthTimer = setInterval(
    safeRunStreamingHealthJob,
    streamingHealthIntervalMs
  );
}

async function stopWorker(signal: string) {
  console.log(`[WORKER] Recibida señal ${signal}. Cerrando...`);

  if (streamingHealthTimer) {
    clearInterval(streamingHealthTimer);
    streamingHealthTimer = null;
  }

  process.exit(0);
}

process.on("SIGINT", () => {
  void stopWorker("SIGINT");
});

process.on("SIGTERM", () => {
  void stopWorker("SIGTERM");
});

startWorker().catch((error) => {
  console.error("[WORKER FATAL]", error);
  process.exit(1);
});