const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const standaloneDir = path.join(rootDir, ".next", "standalone");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }

  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(standaloneDir)) {
  console.error("Standalone build output not found. Run `npm run build` first.");
  process.exit(1);
}

copyDir(path.join(rootDir, "public"), path.join(standaloneDir, "public"));
copyDir(
  path.join(rootDir, ".next", "static"),
  path.join(standaloneDir, ".next", "static")
);

console.log("✓ Copied public assets and static files into standalone output");
