// batchManager.ts
import { client } from "@repo/db";
import { logger } from "../utils/logger";

const BATCH_INTERVAL = 2000; // 2 second
const MAX_BATCH_SIZE = 20;

type UpdateEntry = Record<string, any>;

// structure -> {type: {id: [update1, update2,...]}}
let buffer: Record<string, Record<string, UpdateEntry[]>> = {};
let timer: NodeJS.Timeout | null = null;
let flushing = false;

const batchManager = {
    enqueue(id: string, type: string, updates: any) {
        if (!buffer[type]) buffer[type] = {};
        if (!buffer[type][id]) buffer[type][id] = [];

        buffer[type][id].push(updates);

        logger.info("batchManager", "queue", `Queued ${type}:${id} | Total: ${buffer[type][id].length}`);


        // if too many updates in memory flush immediately
        const totalQueued = Object.values(buffer)
            .reduce((acc, t) => acc + Object.keys(t).length, 0);

        // Adaptive flush logic
        if (totalQueued >= MAX_BATCH_SIZE) {
            logger.info("batchManager", "queue", `Max batch size reached (${totalQueued}), flushing now.`);
            flush();
        }

        // otherwise flush in every timer seconds
        else if (!timer) timer = setTimeout(flush, BATCH_INTERVAL);
    },
};

async function flush() {
    if (flushing) {
        logger.info("batchManager", "flush", "Skipped — already flushing.");
        return;
    }

    flushing = true;
    clearTimeout(timer as NodeJS.Timeout);
    timer = null;

    const pending = { ...buffer };
    buffer = {};

    if (Object.keys(pending).length === 0) {
        logger.info("batchManager", "flush", "No pending updates.");
        flushing = false;
        return;
    }

    // for debugging
    logger.info("batchManager", "flush", "Starting flush...");
    logger.info("batchManager", "flush", "Pending types:", `${Object.keys(pending).join(", ")}`);

    try {
        for (const [type, shapes] of Object.entries(pending)) {
            logger.info("batchManager", "flush", `${type} →`, `${Object.keys(shapes).length} shapes.`);

            const ops: Promise<any>[] = [];

            for (const [id, updatesList] of Object.entries(shapes)) {
                logger.info("batchManager", "flush", `Processing id: ${id}, total updates: ${updatesList.length}`);

                // Remove 'type' from each update object before merging
                const cleanedUpdatesList = updatesList.map(u => {
                    const { type, ...rest } = u;
                    return rest;
                })

                logger.info("batchManager", "flush", `After cleaning type, id->${id}, shapes`, cleanedUpdatesList);

                const merged = Object.assign({}, ...cleanedUpdatesList); // merge fields

                logger.info("batchManager", "flush", `Merged update for id ${id}`, merged);

                // select prisma model to update
                let model: any;
                switch (type) {
                    case "RECTANGLE": model = client.rectangle; break;
                    case "ELLIPSE": model = client.ellipse; break;
                    case "LINE": model = client.line; break;
                    case "ARROW": model = client.arrow; break;
                    case "TEXT": model = client.textShape; break;
                    case "PEN": model = client.stroke; break;
                    default:
                        logger.warn("batchManager", "flush", `Skipped unknown shape type: ${type}`);
                        continue;
                }

                ops.push(
                    model.update({
                        where: { id: String(id) },
                        data: merged,
                    })
                );

                if (ops.length) {
                    logger.info("batchManager", "flush", `DB:Executing ${ops.length} ${type} updates...`);

                    const results = await Promise.allSettled(ops);
                    const success = results.filter(r => r.status === "fulfilled").length;
                    const failed = results.filter(r => r.status === "rejected").length;

                    logger.info("batchManager", "flush", `DB:flush complete. ✅ ${success} success, ❌ ${failed} failed`)
                }
            }
        }
    } catch (err) {
        logger.error("batchManager", "flush", "Error occured in flush, error", err);
    } finally {
        flushing = false;

        // Check if new updates arrived during flush
        if (Object.keys(buffer).length > 0) {
            logger.info("batchManager", "flush", `New updates arrived during flush — scheduling another flush.`);

            timer = setTimeout(flush, BATCH_INTERVAL);
        }
    }
}

// auto-flush on process exit
process.on("exit", async () => {
    logger.info("batchManager", "on EXIT", "Process exiting. Flushing remaining updates...");
    await flush();
});

process.on("SIGINT", async () => {
    logger.info("batchManager", "on SIGINT", "SIGINT received. Flushing remaining updates...");
    await flush();
    process.exit(0);
});

export { batchManager };