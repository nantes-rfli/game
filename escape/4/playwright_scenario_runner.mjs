import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

function parseArgs(argv) {
  const args = {
    url: null,
    scenarioFile: null,
    outputDir: "output/web-game/scenario",
    headless: true,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--url" && next) {
      args.url = next;
      i += 1;
      continue;
    }
    if (arg === "--scenario-file" && next) {
      args.scenarioFile = next;
      i += 1;
      continue;
    }
    if (arg === "--output-dir" && next) {
      args.outputDir = next;
      i += 1;
      continue;
    }
    if (arg === "--headless" && next) {
      args.headless = next !== "0" && next !== "false";
      i += 1;
    }
  }
  if (!args.url) throw new Error("--url is required");
  if (!args.scenarioFile) throw new Error("--scenario-file is required");
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (firstError) {
    const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
    const fallback = path.join(
      codexHome,
      "skills",
      "develop-web-game",
      "node_modules",
      "playwright",
      "index.mjs"
    );
    if (!fs.existsSync(fallback)) {
      throw new Error(
        `playwright module not found. Tried default import and fallback: ${fallback}\n${String(firstError)}`
      );
    }
    return import(pathToFileURL(fallback).href);
  }
}

async function renderState(page) {
  const raw = await page.evaluate(() => {
    if (typeof window.render_game_to_text === "function") return window.render_game_to_text();
    return null;
  });
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return { __raw: raw };
  }
}

function getByPath(obj, dotPath) {
  return dotPath.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

async function saveCapture(page, outDir, name) {
  const pngPath = path.join(outDir, `${name}.png`);
  const jsonPath = path.join(outDir, `${name}.state.json`);
  await page.screenshot({ path: pngPath, fullPage: false });
  const state = await renderState(page);
  if (state) {
    fs.writeFileSync(jsonPath, JSON.stringify(state, null, 2));
  }
}

async function runScenario(page, scenario, outDir) {
  let captureCount = 0;
  for (let i = 0; i < scenario.steps.length; i += 1) {
    const step = scenario.steps[i];
    const type = step.type;
    if (type === "click") {
      const index = Number.isInteger(step.index) ? step.index : 0;
      await page.locator(step.selector).nth(index).click({ timeout: step.timeoutMs ?? 5000 });
      continue;
    }
    if (type === "fill") {
      const index = Number.isInteger(step.index) ? step.index : 0;
      await page.locator(step.selector).nth(index).fill(String(step.value ?? ""), {
        timeout: step.timeoutMs ?? 5000,
      });
      continue;
    }
    if (type === "press") {
      await page.keyboard.press(step.key);
      continue;
    }
    if (type === "wait") {
      await page.waitForTimeout(step.ms ?? 100);
      continue;
    }
    if (type === "advanceTime") {
      await page.evaluate(async (ms) => {
        if (typeof window.advanceTime === "function") {
          await window.advanceTime(ms);
        }
      }, step.ms ?? 16);
      continue;
    }
    if (type === "capture") {
      const name = step.name || `capture-${String(captureCount).padStart(2, "0")}`;
      captureCount += 1;
      await saveCapture(page, outDir, name);
      continue;
    }
    if (type === "assert") {
      const current = await renderState(page);
      if (!current) throw new Error("render_game_to_text is unavailable");
      const actual = getByPath(current, step.path);
      if (actual !== step.equals) {
        throw new Error(
          `Assertion failed at step ${i} path=${step.path} expected=${JSON.stringify(step.equals)} actual=${JSON.stringify(actual)}`
        );
      }
      continue;
    }
    throw new Error(`Unsupported step type: ${type}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  ensureDir(args.outputDir);

  const scenarioRaw = fs.readFileSync(args.scenarioFile, "utf-8");
  const scenario = JSON.parse(scenarioRaw);
  if (!Array.isArray(scenario.steps)) {
    throw new Error("scenario file must include steps array");
  }

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: args.headless });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push({ type: "console.error", text: msg.text() });
  });
  page.on("pageerror", (err) => errors.push({ type: "pageerror", text: String(err) }));

  await page.goto(args.url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(scenario.initialWaitMs ?? 350);

  await runScenario(page, scenario, args.outputDir);
  await saveCapture(page, args.outputDir, "final");

  if (errors.length > 0) {
    fs.writeFileSync(path.join(args.outputDir, "errors.json"), JSON.stringify(errors, null, 2));
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
