import { Types } from "mongoose";
import ActiveConnection from "@/models/ActiveConnection";

const CONNECTION_TTL_SECONDS = 90;

function getExpiresAt() {
    return new Date(Date.now() + CONNECTION_TTL_SECONDS * 1000);
}

export function getClientIp(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for");

    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() || "";
    }

    return (
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        ""
    );
}

export function getDeviceId(request: Request, userId: string) {
    const headerDeviceId =
        request.headers.get("x-device-id") ||
        request.headers.get("x-deviceid") ||
        "";

    const cleanDeviceId = headerDeviceId.trim();

    if (cleanDeviceId) {
        return cleanDeviceId.slice(0, 120);
    }

    const userAgent = request.headers.get("user-agent") || "unknown-device";

    return `${userId}-${Buffer.from(userAgent).toString("base64").slice(0, 60)}`;
}

export async function countActiveConnectionsByUser(userId: string) {
    return ActiveConnection.countDocuments({
        userId: new Types.ObjectId(userId),
        expiresAt: { $gt: new Date() },
    });
}

export async function getActiveConnectionByDevice(
    userId: string,
    deviceId: string
) {
    return ActiveConnection.findOne({
        userId: new Types.ObjectId(userId),
        deviceId,
        expiresAt: { $gt: new Date() },
    });
}

export async function assertConnectionLimit({
    userId,
    deviceId,
    conexionesPermitidas,
}: {
    userId: string;
    deviceId: string;
    conexionesPermitidas: number;
}) {
    const limit = Math.max(Number(conexionesPermitidas || 1), 1);

    const existingDevice = await getActiveConnectionByDevice(userId, deviceId);

    if (existingDevice) {
        return {
            allowed: true,
            activeConnections: await countActiveConnectionsByUser(userId),
            limit,
            reason: "existing-device",
        };
    }

    const activeConnections = await countActiveConnectionsByUser(userId);

    if (activeConnections >= limit) {
        return {
            allowed: false,
            activeConnections,
            limit,
            reason: "limit-reached",
        };
    }

    return {
        allowed: true,
        activeConnections,
        limit,
        reason: "new-device",
    };
}

export async function registerActiveConnection({
    userId,
    deviceId,
    channelId,
    channelName,
    ip,
    userAgent,
    strategy,
    streamUrl,
    nodeId,
    nodeName,
    nodeCode,
}: {
    userId: string;
    deviceId: string;
    channelId?: string;
    channelName?: string;
    ip?: string;
    userAgent?: string;
    strategy?: string;
    streamUrl?: string;
    nodeId?: string | null;
    nodeName?: string;
    nodeCode?: string;
}) {
    const now = new Date();

    return ActiveConnection.findOneAndUpdate(
        {
            userId: new Types.ObjectId(userId),
            deviceId,
        },
        {
            $set: {
                channelId: channelId ? new Types.ObjectId(channelId) : null,
                channelName: channelName || "",
                ip: ip || "",
                userAgent: userAgent || "",
                strategy: strategy || "",
                streamUrl: streamUrl || "",
                nodeId: nodeId ? new Types.ObjectId(nodeId) : null,
                nodeName: nodeName || "",
                nodeCode: nodeCode || "",
                lastSeenAt: now,
                expiresAt: getExpiresAt(),
            },
            $setOnInsert: {
                userId: new Types.ObjectId(userId),
                deviceId,
                startedAt: now,
            },
        },
        {
            returnDocument: "after",
            upsert: true,
        }
    );
}

export async function renewActiveConnection({
    userId,
    deviceId,
    ip,
    userAgent,
}: {
    userId: string;
    deviceId: string;
    ip?: string;
    userAgent?: string;
}) {
    const now = new Date();

    return ActiveConnection.findOneAndUpdate(
        {
            userId: new Types.ObjectId(userId),
            deviceId,
        },
        {
            $set: {
                ip: ip || "",
                userAgent: userAgent || "",
                lastSeenAt: now,
                expiresAt: getExpiresAt(),
            },
            $setOnInsert: {
                userId: new Types.ObjectId(userId),
                deviceId,
                startedAt: now,
            },
        },
        {
            returnDocument: "after",
            upsert: true,
        }
    );
}

export async function getActiveConnectionsSummary() {
    const now = new Date();

    return ActiveConnection.find({
        expiresAt: { $gt: now },
    })
        .populate("userId", "nombre email plan conexionesPermitidas estado localidad")
        .sort({ lastSeenAt: -1 })
        .lean();
}