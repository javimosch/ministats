import { readFileSync, writeFileSync, existsSync } from "node:fs";
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
const xzPath = join(distPath, "ministats.xz");

execSync("rm -f dist/ministats dist/ministats.xz");
execSync("bun build src/index.ts --outfile dist/ministats --target=bun-linux-x64-baseline --compile --minify --production --bytecode", { stdio: "inherit" });
console.log("Binary built");

execSync(`xz -9 ${join(distPath, "ministats")}`, { stdio: "inherit" });
execSync("chmod +x dist/ministats*", { stdio: "inherit" });
console.log("Binary compressed");

execSync("git add -A", { stdio: "inherit" });
execSync(`git commit -m "${newVersion}"`, { stdio: "inherit" });
execSync(`git tag -a v${newVersion} -m "v${newVersion}"`, { stdio: "inherit" });
execSync("git push origin master --tags", { stdio: "inherit" });
console.log("Code pushed");

try {
  execSync(`gh release create v${newVersion} --title "MiniStats v${newVersion}" --notes "MiniStats v${newVersion}"`, { stdio: "inherit" });
  console.log("Release created");
  execSync(`gh release upload v${newVersion} ${xzPath}`, { stdio: "inherit" });
  console.log("Binary attached");
} catch (err) {
  console.error("GitHub release failed, code pushed but no release created");
  process.exit(1);
}

console.log("Deployed!");
