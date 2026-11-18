#!/usr/bin/env node
// List upgrade targets for every pinned dependency that are at least N days old.
//
// Usage (from an app or this repo's root):
//   node scripts/aged-versions.mjs [package.json] [days=7]
//   node node_modules/srcdev-nuxt-components/scripts/aged-versions.mjs package.json 7
//
// Columns:
//   same major   newest stable version in the current major that is >= N days old ("=" if already there)
//   new major    newest stable version in a later major that is >= N days old
//   blocked      a newer stable version exists but is younger than N days, so it is skipped
//
// Covers dependencies, devDependencies and overrides. Ranges ("^1.2.0", "*") are skipped: only
// exact pins are compared. Prereleases are ignored. Pair with `npm install --min-release-age=N`
// so transitive packages get the same age floor.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const [pkgPath = "package.json", daysArg = "7"] = process.argv.slice(2);
const days = Number(daysArg);
if (!Number.isFinite(days) || days < 0) {
  console.error(`days must be a non-negative number, got "${daysArg}"`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const cutoff = Date.now() - days * 864e5;
const sources = [
  ["dep", pkg.dependencies],
  ["dev", pkg.devDependencies],
  ["override", Object.fromEntries(Object.entries(pkg.overrides ?? {}).filter(([, v]) => typeof v === "string"))],
];

const isStable = (v) => /^\d+\.\d+\.\d+$/.test(v);
const major = (v) => v.split(".")[0];
const compare = (a, b) => {
  const x = a.split(".").map(Number);
  const y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

const rows = [];
for (const [section, deps] of sources) {
  for (const [name, current] of Object.entries(deps ?? {})) {
    if (!isStable(current)) {
      rows.push([name, section, current, "(range, skipped)", "", ""]);
      continue;
    }
    let time;
    try {
      time = JSON.parse(execFileSync("npm", ["view", name, "time", "--json"], { encoding: "utf8" }));
    } catch {
      rows.push([name, section, current, "(npm view failed)", "", ""]);
      continue;
    }
    const age = (v) => `${Math.floor((Date.now() - Date.parse(time[v])) / 864e5)}d`;
    const stable = Object.keys(time).filter(isStable).sort(compare);
    const aged = stable.filter((v) => Date.parse(time[v]) <= cutoff);
    const sameMajor = aged.filter((v) => major(v) === major(current)).at(-1);
    const newest = aged.at(-1);
    const latest = stable.at(-1);
    rows.push([
      name,
      section,
      current,
      !sameMajor || compare(sameMajor, current) <= 0 ? "=" : `${sameMajor} (${age(sameMajor)})`,
      newest && Number(major(newest)) > Number(major(current)) ? `${newest} (${age(newest)})` : "",
      latest && latest !== newest && compare(latest, current) > 0 ? `${latest} (${age(latest)})` : "",
    ]);
  }
}

const header = ["package", "section", "current", "same major", "new major", `blocked (<${days}d)`];
const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)) + 2);
const line = (r) => r.map((c, i) => String(c).padEnd(widths[i])).join("").trimEnd();
console.log(line(header));
for (const r of rows) console.log(line(r));
