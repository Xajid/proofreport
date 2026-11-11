import { spawnSync } from "node:child_process";

const url = process.env.DATABASE_URL?.trim() ?? "";
if (!url) {
  console.log("db-setup: DATABASE_URL unset — skipping prisma db push / seed (set it for hosted deploys)");
  process.exit(0);
}

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

run("npx", ["prisma", "db", "push"]);
run("npx", ["tsx", "prisma/seed.ts"]);
