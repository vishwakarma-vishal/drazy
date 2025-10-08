// batchManager.ts
import { client } from "@repo/db";

const BATCH_INTERVAL = 2000; // 2 second
const MAX_BATCH_SIZE = 20;
const DEBUG = process.env.DEBUG === "true";

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

        if (DEBUG) {
            console.log(`[BatchManager][QUEUE] Queued ${type}:${id} | Total: ${buffer[type][id].length}`);
        }

        // if too many updates in memory flush immediately
        const totalQueued = Object.values(buffer)
            .reduce((acc, t) => acc + Object.keys(t).length, 0);

        // Adaptive flush logic
        if (totalQueued >= MAX_BATCH_SIZE) {
            if (DEBUG) console.log(`[BatchManager][QUEUE] Max batch size reached (${totalQueued}), flushing now.`);
            flush();
        }

        // otherwise flush in every timer seconds
        else if (!timer) timer = setTimeout(flush, BATCH_INTERVAL);
    },
};

async function flush() {
    if (flushing) {
        if (DEBUG) console.log(`[BatchManager][FLUSH] Skipped — already flushing.`);
        return;
    }

    flushing = true;
    clearTimeout(timer as NodeJS.Timeout);
    timer = null;

    const pending = { ...buffer };
    buffer = {};

    if (Object.keys(pending).length === 0) {
        if (DEBUG) console.log(`[BatchManager][FLUSH] No pending updates.`);
        flushing = false;
        return;
    }

    if (DEBUG) {
        console.log(`[BatchManager][FLUSH] Starting flush...`);
        console.log(`[BatchManager][FLUSH] Pending types: ${Object.keys(pending).join(", ")}`);
    }

    try {
        for (const [type, shapes] of Object.entries(pending)) {
            if (DEBUG) console.log(`[BatchManager][FLUSH] ${type} → ${Object.keys(shapes).length} shapes.`);

            const ops: Promise<any>[] = [];

            for (const [id, updatesList] of Object.entries(shapes)) {
                if (DEBUG) console.log(`[BatchManager][FLUSH] Processing id: ${id}, total updates: ${updatesList.length}`);

                // Remove 'type' from each update object before merging
                const cleanedUpdatesList = updatesList.map(u => {
                    const { type, ...rest } = u;
                    return rest;
                })

                if (DEBUG) console.log(`[BatchManager][FLUSH] After cleaning type, id->${id}, shapes->${JSON.stringify(cleanedUpdatesList)}`);

                const merged = Object.assign({}, ...cleanedUpdatesList); // merge fields

                if (DEBUG) console.log(`[BatchManager][FLUSH] Merged update for id ${id}: ${JSON.stringify(merged)}`);

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
                        if (DEBUG)
                            console.log(`[BatchManager][SKIP] Unknown shape type: ${type}`);
                        continue;
                }

                ops.push(
                    model.update({
                        where: { id: String(id) },
                        data: merged,
                    })
                );

                if (ops.length) {
                    if (DEBUG)
                        console.log(`[BatchManager][DB] Executing ${ops.length} ${type} updates...`);

                    const results = await Promise.allSettled(ops);

                    if (DEBUG) {
                        const success = results.filter(r => r.status === "fulfilled").length;
                        const failed = results.filter(r => r.status === "rejected").length;
                        console.log(
                            `[BatchManager][DB] ${type} flush complete. ✅ ${success} success, ❌ ${failed} failed`
                        );
                    }
                }
            }
        }
    } catch (err) {
        console.error(`[BatchManager][ERROR]`, err);
    } finally {
        flushing = false;

        // Check if new updates arrived during flush
        if (Object.keys(buffer).length > 0) {
            if (DEBUG) console.log(`[BatchManager][FLUSH] New updates arrived during flush — scheduling another flush.`);
            timer = setTimeout(flush, BATCH_INTERVAL);
        }
    }
}

// auto-flush on process exit
process.on("exit", async () => {
    if (DEBUG) console.log("[BatchManager] Process exiting. Flushing remaining updates...");
    await flush();
});

process.on("SIGINT", async () => {
    if (DEBUG) console.log("[BatchManager] SIGINT received. Flushing remaining updates...");
    await flush();
    process.exit(0);
});

export { batchManager };