const fs = require('fs');
const path = require('path');

const COPY_ITEMS = [
  { src: 'src/html', dest: 'public/html' },
  { src: 'src/css', dest: 'public/css' },
  { src: 'src/js', dest: 'public/js' },
  { src: 'src/assets', dest: 'public/assets' }
];

async function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      await removeDir(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dir);
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

async function build() {
  const outDir = path.resolve(__dirname, 'public');
  await removeDir(outDir);
  for (const item of COPY_ITEMS) {
    const srcPath = path.resolve(__dirname, item.src);
    const destPath = path.resolve(__dirname, item.dest);
    if (!fs.existsSync(srcPath)) {
      continue;
    }
    copyRecursive(srcPath, destPath);
  }
  console.log('Built static site into public/');
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
