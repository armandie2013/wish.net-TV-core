import { refreshAllStreamingNodesHealth } from "../../src/services/streaming-node-health.service";

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;

  return `${(ms / 1000).toFixed(1)}s`;
}

export async function runStreamingHealthJob() {
  const startedAt = Date.now();

  const summary = await refreshAllStreamingNodesHealth({
    includeSuspended: false,
    batchSize: Number(process.env.STREAMING_HEALTH_BATCH_SIZE || 4),
  });

  const duration = Date.now() - startedAt;

  console.log(
    [
      "[STREAMING HEALTH]",
      `total=${summary.total}`,
      `checked=${summary.checked}`,
      `online=${summary.online}`,
      `offline=${summary.offline}`,
      `unknown=${summary.unknown}`,
      `errors=${summary.errors}`,
      `duration=${formatDuration(duration)}`,
    ].join(" ")
  );

  const offlineNodes = summary.results.filter(
    (node) => node.healthStatus === "offline"
  );

  if (offlineNodes.length > 0) {
    offlineNodes.forEach((node) => {
      console.log(
        `[STREAMING OFFLINE] ${node.codigo || node.nombre} - ${
          node.lastError || "Sin detalle"
        }`
      );
    });
  }

  return summary;
}