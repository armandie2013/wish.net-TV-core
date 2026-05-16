import ActiveConnection from "@/models/ActiveConnection";

type IndexSpec = {
  name?: string;
  key?: Record<string, number>;
  expireAfterSeconds?: number;
};

declare global {
  // eslint-disable-next-line no-var
  var databaseIndexesReady: Promise<void> | undefined;
}

async function ensureActiveConnectionTtlIndex() {
  const collection = ActiveConnection.collection;

  const indexes = (await collection.indexes()) as IndexSpec[];

  const expiresAtIndex = indexes.find((index) => index.name === "expiresAt_1");

  if (expiresAtIndex && expiresAtIndex.expireAfterSeconds !== 0) {
    console.log(
      "[DB INDEX] Reemplazando índice expiresAt_1 por TTL expireAfterSeconds: 0"
    );

    await collection.dropIndex("expiresAt_1");
  }

  const refreshedIndexes = (await collection.indexes()) as IndexSpec[];

  const hasValidExpiresAtTtl = refreshedIndexes.some(
    (index) =>
      index.name === "expiresAt_1" &&
      index.expireAfterSeconds === 0 &&
      index.key?.expiresAt === 1
  );

  if (!hasValidExpiresAtTtl) {
    console.log("[DB INDEX] Creando índice TTL expiresAt_1");

    await collection.createIndex(
      { expiresAt: 1 },
      {
        name: "expiresAt_1",
        expireAfterSeconds: 0,
      }
    );
  }

  const cleanupResult = await collection.deleteMany({
    expiresAt: { $lte: new Date() },
  });

  if (cleanupResult.deletedCount > 0) {
    console.log(
      `[DB CLEANUP] Conexiones activas vencidas eliminadas: ${cleanupResult.deletedCount}`
    );
  }
}

export async function ensureDatabaseIndexes() {
  if (!global.databaseIndexesReady) {
    global.databaseIndexesReady = (async () => {
      await ensureActiveConnectionTtlIndex();
    })().catch((error) => {
      global.databaseIndexesReady = undefined;
      console.error("[DB INDEX ERROR]", error);
      throw error;
    });
  }

  return global.databaseIndexesReady;
}