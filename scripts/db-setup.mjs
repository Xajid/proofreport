import { spawnSync } from "node:child_process";

const url = process.env.DATABASE_URL?.trim() ?? "";
if (!url) {
  console.log("db-setup: DATABASE_URL unset — skipping prisma db push / seed (set it for hosted deploys)");
  process.exit(0);
}

function run(cmd, args) {
  console.log(`db-setup: running ${cmd} ${args.join(" ")}...`);
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  if (res.status !== 0) {
    console.error(`db-setup: ${cmd} ${args.join(" ")} exited with status ${res.status}`);
    process.exit(res.status ?? 1);
  }
}

try {
  run("npx", ["prisma", "db", "push", "--skip-generate", "--accept-data-loss"]);
  run("npx", ["tsx", "prisma/seed.ts"]);
  console.log("db-setup: complete!");
} catch (err) {
  console.error("db-setup failed:", err);
  process.exit(1);
}
