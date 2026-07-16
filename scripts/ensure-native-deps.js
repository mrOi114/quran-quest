/**
 * Ensures Windows native optional deps for NativeWind (lightningcss) are present.
 * npm sometimes omits platform binaries; this repairs the common Windows case.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isWin64 = process.platform === 'win32' && process.arch === 'x64';
if (!isWin64) {
  process.exit(0);
}

const root = path.join(__dirname, '..');
const pkgName = 'lightningcss-win32-x64-msvc';
const version = '1.27.0';
const binaryName = 'lightningcss.win32-x64-msvc.node';
const pkgDir = path.join(root, 'node_modules', pkgName);
const binaryPath = path.join(pkgDir, binaryName);

function copyBinaryFallbacks() {
  if (!fs.existsSync(binaryPath)) {
    return;
  }

  const targets = [
    path.join(root, 'node_modules', 'lightningcss', binaryName),
    path.join(
      root,
      'node_modules',
      'react-native-css-interop',
      'node_modules',
      'lightningcss',
      binaryName,
    ),
  ];

  for (const target of targets) {
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) {
      continue;
    }
    fs.copyFileSync(binaryPath, target);
  }
}

function ensurePlatformPackage() {
  if (fs.existsSync(binaryPath)) {
    return;
  }

  console.warn(`[postinstall] Missing ${binaryName}. Restoring ${pkgName}@${version}…`);

  const tarball = path.join(root, `${pkgName}-${version}.tgz`);
  execSync(`npm pack ${pkgName}@${version} --pack-destination "${root}"`, {
    stdio: 'inherit',
  });

  fs.mkdirSync(pkgDir, { recursive: true });
  execSync(`tar -xf "${tarball}" -C "${pkgDir}" --strip-components=1`, {
    stdio: 'inherit',
  });
  fs.unlinkSync(tarball);

  if (!fs.existsSync(binaryPath)) {
    throw new Error(`Extracted ${pkgName} but ${binaryName} is still missing.`);
  }
}

try {
  ensurePlatformPackage();
  copyBinaryFallbacks();
} catch (error) {
  console.warn(
    `[postinstall] Could not restore ${pkgName}. NativeWind may fail until this is fixed.`,
  );
  console.warn(error instanceof Error ? error.message : error);
  console.warn(
    '[postinstall] Use Node 20–22 LTS and install the Microsoft VC++ Redistributable (x64).',
  );
}
