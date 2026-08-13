#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const semver = require('semver');

const ROOT = path.resolve(__dirname, '..');
const RELEASE_TYPE = process.argv[2];

const FILES = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.js',
  'popup-i18n.js',
  'background.js',
  'content.js',
];

const FOLDERS = ['icons', 'src'];

function die(msg) {
  console.error(`\nERRO: ${msg}`);
  process.exit(1);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

// --- Validação ---

if (!['major', 'minor', 'patch'].includes(RELEASE_TYPE)) {
  die('Informe o tipo: major | minor | patch\nUso: node scripts/bump-version.js <major|minor|patch>');
}

// --- Bump de versão ---

const manifestPath = path.join(ROOT, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const currentVersion = manifest.version;
const newVersion = semver.inc(currentVersion, RELEASE_TYPE);

if (!newVersion) die(`Versão inválida no manifest.json: "${currentVersion}"`);

manifest.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest.json  ${currentVersion} → ${newVersion}`);

const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`package.json   ${currentVersion} → ${newVersion}`);

// --- Empacotamento ---

const distDir = path.join(ROOT, 'dist');
const zipName = `despertador-ponto-v${newVersion}.zip`;
const zipPath = path.join(distDir, zipName);
const tempDir = path.join(ROOT, '.build-temp');

fs.mkdirSync(distDir, { recursive: true });

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
fs.mkdirSync(tempDir);

for (const file of FILES) {
  const src = path.join(ROOT, file);
  if (!fs.existsSync(src)) {
    console.warn(`  aviso: arquivo não encontrado, ignorando — ${file}`);
    continue;
  }
  fs.copyFileSync(src, path.join(tempDir, file));
}

for (const folder of FOLDERS) {
  const src = path.join(ROOT, folder);
  if (!fs.existsSync(src)) {
    console.warn(`  aviso: pasta não encontrada, ignorando — ${folder}/`);
    continue;
  }
  copyDir(src, path.join(tempDir, folder));
}

if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

try {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -CompressionLevel Optimal"`,
    { stdio: 'pipe' }
  );
} catch (err) {
  fs.rmSync(tempDir, { recursive: true });
  die(`Falha ao criar ZIP:\n${err.stderr?.toString() || err.message}`);
}

fs.rmSync(tempDir, { recursive: true });

const sizeKB = (fs.statSync(zipPath).size / 1024).toFixed(1);

console.log(`\nv${newVersion} empacotada → dist/${zipName} (${sizeKB} KB)`);
console.log('\nPróximos passos:');
console.log('  1. Acesse https://chrome.google.com/webstore/devconsole');
console.log(`  2. Faça upload de: dist/${zipName}`);
