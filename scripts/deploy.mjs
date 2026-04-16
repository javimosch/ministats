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
writeFileSync(join(__dirname, "..", "src", "version.ts"), `export const version = "${newVersion}";\n`);
console.log(`Version bumped to ${newVersion}`);

const distPath = join(__dirname, "..", "dist");

execSync("rm -f dist/ministats*");
console.log("Building x64 binary...");
execSync("bun build src/index.ts --outfile dist/ministats-x64 --target=bun-linux-x64-baseline --compile --minify --production --bytecode", { stdio: "inherit" });
console.log("Building arm64 binary...");
execSync("bun build src/index.ts --outfile dist/ministats-arm64 --target=bun-linux-arm64-baseline --compile --minify --production --bytecode", { stdio: "inherit" });
console.log("Binaries built");

execSync("cp dist/ministats-x64 dist/ministats", { stdio: "inherit" });
execSync(`xz -9 -f ${join(distPath, "ministats-x64")} && xz -9 -f ${join(distPath, "ministats-arm64")}`, { stdio: "inherit" });
execSync("chmod +x dist/ministats*", { stdio: "inherit" });
console.log("Binaries compressed");

execSync("git add -A", { stdio: "inherit" });
execSync(`git commit -m "${newVersion}"`, { stdio: "inherit" });
execSync(`git tag -a v${newVersion} -m "v${newVersion}"`, { stdio: "inherit" });
execSync("git push origin master --tags", { stdio: "inherit" });
console.log("Code pushed");

try {
  execSync(`gh release create v${newVersion} --title "MiniStats v${newVersion}" --notes "MiniStats v${newVersion}"`, { stdio: "inherit" });
  console.log("Release created");
  execSync(`gh release upload v${newVersion} ${distPath}/ministats-x64.xz ${distPath}/ministats-arm64.xz`, { stdio: "inherit" });
  console.log("Binaries attached");
} catch (err) {
  console.error("GitHub release failed, code pushed but no release created");
  process.exit(1);
}

console.log("Deployed!");
