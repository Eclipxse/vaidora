import "dotenv/config";
import { processNextJob } from "../src/lib/generation";
let stop = false;
process.on("SIGINT", () => {
  stop = true;
});
process.on("SIGTERM", () => {
  stop = true;
});
async function main() {
  console.log("Vaidora image worker ready.");
  while (!stop) {
    try {
      const worked = await processNextJob();
      if (!worked) await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error(
        "Worker error:",
        e instanceof Error ? e.message : "Unknown error",
      );
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}
main();
