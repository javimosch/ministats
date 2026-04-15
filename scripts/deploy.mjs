import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

const [major, minor, patch] = pkg.version.split(".").map(Number);
const newVersion = `${major}.${minor}.${patch + 1}`;
pkg.version = newVersion;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`Version bumped: ${pkg.version} -> ${newVersion}`);

execSync("git add -A", { stdio: "inherit" });
execSync(`git commit -m "${newVersion}"`, { stdio: "inherit" });
execSync("git push", { stdio: "inherit" });
console.log("Deployed!");
