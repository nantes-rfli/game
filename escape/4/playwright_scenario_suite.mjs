import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const args = {
    url: null,
    scenariosFile: "escape/4/scenarios/suite.json",
    outputDir: "output/web-game/suite",
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
    if (arg === "--scenarios-file" && next) {
      args.scenariosFile = next;
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
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function getByPath(obj, dotPath) {
  const normalized = String(dotPath)
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let current = obj;
  for (const key of normalized) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function validateScenarioOutput({ scenarioOut, checks, requireNoErrors }) {
  const issues = [];
  const errorsPath = path.join(scenarioOut, "errors.json");
  const statePath = path.join(scenarioOut, "final.state.json");

  if (requireNoErrors && fs.existsSync(errorsPath)) {
    issues.push(`errors.json exists (${errorsPath})`);
  }

  const finalState = readJsonSafe(statePath);
  if (!finalState) {
    issues.push(`missing final state (${statePath})`);
  } else {
    for (const check of checks) {
      const actual = getByPath(finalState, check.path);
      if (actual !== check.equals) {
        issues.push(
          `check failed path=${check.path} expected=${JSON.stringify(check.equals)} actual=${JSON.stringify(actual)}`
        );
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    statePath,
  };
}

function loadScenarios(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  const rows = Array.isArray(parsed) ? parsed : parsed.scenarios;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("scenarios file must be a non-empty array or {scenarios:[...]}");
  }
  return rows.map((row, i) => {
    if (typeof row === "string") {
      return {
        name: path.basename(row, path.extname(row)),
        file: row,
        checks: [],
        requireNoErrors: true,
      };
    }
    if (row && typeof row === "object" && row.name && row.file) {
      const checks = Array.isArray(row.checks)
        ? row.checks.map((check, idx) => {
            if (!check || typeof check.path !== "string" || !("equals" in check)) {
              throw new Error(`invalid check at scenario=${row.name} index=${idx}`);
            }
            return { path: check.path, equals: check.equals };
          })
        : [];
      return {
        name: String(row.name),
        file: String(row.file),
        checks,
        requireNoErrors: row.requireNoErrors !== false,
      };
    }
    throw new Error(`invalid scenario entry at index ${i}`);
  });
}

function runOneScenario({ url, scenarioFile, outputDir, headless }) {
  const cmdArgs = [
    "escape/4/playwright_scenario_runner.mjs",
    "--url",
    url,
    "--scenario-file",
    scenarioFile,
    "--output-dir",
    outputDir,
    "--headless",
    headless ? "1" : "0",
  ];
  return spawnSync("node", cmdArgs, { stdio: "inherit" });
}

function main() {
  const args = parseArgs(process.argv);
  const scenarios = loadScenarios(args.scenariosFile);
  ensureDir(args.outputDir);

  const baseDir = path.dirname(args.scenariosFile);
  const startedAt = new Date().toISOString();
  const results = [];

  for (const scenario of scenarios) {
    const scenarioFile = path.resolve(baseDir, scenario.file);
    const scenarioOut = path.resolve(args.outputDir, scenario.name);
    ensureDir(scenarioOut);

    const t0 = Date.now();
    const res = runOneScenario({
      url: args.url,
      scenarioFile,
      outputDir: scenarioOut,
      headless: args.headless,
    });
    const elapsedMs = Date.now() - t0;
    const validation = validateScenarioOutput({
      scenarioOut,
      checks: scenario.checks,
      requireNoErrors: scenario.requireNoErrors,
    });
    const runOk = res.status === 0;
    const ok = runOk && validation.ok;

    results.push({
      name: scenario.name,
      file: scenario.file,
      ok,
      runOk,
      validationOk: validation.ok,
      exitCode: res.status,
      elapsedMs,
      issues: validation.issues,
      checks: scenario.checks.length,
      requireNoErrors: scenario.requireNoErrors,
    });
  }

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    allPassed: results.every((r) => r.ok),
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };

  fs.writeFileSync(path.join(args.outputDir, "summary.json"), JSON.stringify(summary, null, 2));

  const summaryLine = `[scenario-suite] total=${summary.total} passed=${summary.passed} failed=${summary.failed}`;
  if (summary.allPassed) {
    console.log(summaryLine);
    process.exit(0);
  }
  console.error(summaryLine);
  process.exit(1);
}

main();
