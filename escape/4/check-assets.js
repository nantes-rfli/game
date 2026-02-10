#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const assetsDir = path.join(repoRoot, "escape", "4", "assets");
const manifestPath = path.join(assetsDir, "manifest.json");

function readJson(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  return JSON.parse(text);
}

function exists(relPath) {
  return fs.existsSync(path.join(assetsDir, relPath));
}

function checkGroup(group) {
  for (const candidate of group.anyOf) {
    if (exists(candidate)) return { ok: true, hit: candidate };
  }
  return { ok: false, hit: null };
}

function main() {
  if (!fs.existsSync(manifestPath)) {
    console.error(`manifest not found: ${manifestPath}`);
    process.exit(2);
  }

  const manifest = readJson(manifestPath);
  const required = Array.isArray(manifest.required) ? manifest.required : [];
  const optional = Array.isArray(manifest.optional) ? manifest.optional : [];

  const missingRequired = [];
  const missingOptional = [];

  console.log("== escape/4 asset check ==");
  console.log(`assets dir: ${assetsDir}`);
  console.log("");

  console.log("-- required --");
  for (const group of required) {
    const result = checkGroup(group);
    if (result.ok) {
      console.log(`OK  ${group.name} -> ${result.hit}`);
    } else {
      console.log(`MISS ${group.name} (anyOf: ${group.anyOf.join(", ")})`);
      missingRequired.push(group);
    }
  }

  console.log("");
  console.log("-- optional --");
  for (const group of optional) {
    const result = checkGroup(group);
    if (result.ok) {
      console.log(`OK  ${group.name} -> ${result.hit}`);
    } else {
      console.log(`MISS ${group.name}`);
      missingOptional.push(group);
    }
  }

  console.log("");
  console.log(`required missing: ${missingRequired.length}`);
  console.log(`optional missing: ${missingOptional.length}`);

  if (missingRequired.length > 0) {
    process.exit(1);
  }
}

main();

