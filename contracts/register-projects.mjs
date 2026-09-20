// Registers every project from src/lib/mockData.ts on the deployed crowdfund contract.
// Usage: node contracts/register-projects.mjs   (needs the `admin` stellar key + .env.local)
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const env = fs.readFileSync(".env.local", "utf8");
const id = env.match(/NEXT_PUBLIC_CROWDFUND_CONTRACT_ID=(\S+)/)[1];
const src = fs.readFileSync("src/lib/mockData.ts", "utf8");
const admin = execFileSync("stellar", ["keys", "address", "admin"], { encoding: "utf8" }).trim();

const projects = [...src.matchAll(/slug: "([^"]+)"[\s\S]*?milestones: \[([\s\S]*?)\n\s*\],/g)].map((m) => ({
  slug: m[1],
  targets: [...m[2].matchAll(/targetAmount: (\d+)/g)].map((t) => Number(t[1])),
}));

for (const p of projects) {
  const payouts = p.targets.map((t, i) => String((t - (p.targets[i - 1] ?? 0)) * 10_000_000));
  try {
    execFileSync("stellar", ["contract", "invoke", "--id", id, "--source", "admin", "--network", "testnet", "--",
      "create_project", "--id", p.slug, "--owner", admin, "--milestone_amounts", JSON.stringify(payouts)],
      { stdio: "pipe" });
    console.log("registered", p.slug, p.targets.join("/"));
  } catch (e) {
    console.log("skip", p.slug, String(e.stderr ?? e).split("\n").find((l) => /Error|error/.test(l)) ?? "");
  }
}
