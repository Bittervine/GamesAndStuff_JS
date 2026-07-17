#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { installNodeCanvasAdapters, makeNodeCanvas } from "./node-canvas-adapters.mjs";

const develDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(develDir, "..");
function resolveProjectPath(value) { const text = String(value || ""); return path.isAbsolute(text) ? text : path.resolve(projectRoot, text); }
function parseArgs(argv) {
  const options = { manifest: "", recording: "recordings/level_001_1.json", width: 1280, height: 720, usePixmapPyramids: false, prewarm: true };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const [rawKey, inlineValue] = arg.startsWith("--") ? arg.slice(2).split("=", 2) : ["", ""];
    if (!rawKey) continue;
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = inlineValue ?? argv[++i];
    if (key === "manifest") options.manifest = value;
    else if (key === "recording") options.recording = value;
    else if (key === "width") options.width = Math.max(1, Math.floor(Number(value) || options.width));
    else if (key === "height") options.height = Math.max(1, Math.floor(Number(value) || options.height));
    else if (key === "usePixmapPyramids") options.usePixmapPyramids = !["0","false","no","off"].includes(String(value).toLowerCase());
    else if (key === "noPrewarm") options.prewarm = false;
    else throw new Error(`Unknown option --${rawKey}`);
  }
  if (!options.manifest) throw new Error("--manifest is required");
  return options;
}
function defaultEnemyCharacterUrls(state) {
    const fromWorld = state?.world?.enemyCharacterProjectUrls;
    return Array.isArray(fromWorld) ? fromWorld.map(String).filter(Boolean) : [];
}
async function main() {
  const options = parseArgs(process.argv.slice(2));
  installNodeCanvasAdapters({ root: projectRoot, width: options.width, height: options.height });
  const [simulation, recordingTools, rendererModule, caveWindowData] = await Promise.all([
    import(pathToFileURL(path.join(projectRoot, "src/core/simulation.js"))),
    import(pathToFileURL(path.join(projectRoot, "src/browser/gameplay-recording.js"))),
    import(pathToFileURL(path.join(projectRoot, "src/presentation/canvas-renderer.js"))),
    import(pathToFileURL(path.join(projectRoot, "src/shared/cave-window-data.js")))
  ]);
  const manifestPath = resolveProjectPath(options.manifest);
  const manifestRoot = path.dirname(manifestPath);
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const requests = Array.isArray(manifest) ? manifest : (Array.isArray(manifest.frames) ? manifest.frames : []);
  const recordingPath = resolveProjectPath(options.recording);
  const recording = recordingTools.normalizeGameplayRecording(JSON.parse(await fs.readFile(recordingPath, "utf8")));
  const indexed = [];
  for (const req of requests) {
    const timeSec = Math.max(0, Number(req.timeSec) || 0);
    const out = req.output || req.path;
    if (!out) continue;
    const index = recording.frames.findIndex(frame => Number(frame.recordingTimeSec) >= timeSec);
    indexed.push({ timeSec, output: path.isAbsolute(out) ? out : path.resolve(manifestRoot, out), index: index >= 0 ? index : recording.frames.length - 1 });
  }
  indexed.sort((a,b)=>a.index-b.index || a.output.localeCompare(b.output));
  if (!indexed.length) throw new Error("Manifest contained no valid requests");
  const state = simulation.cloneGameState(recording.initialState);
  const canvas = makeNodeCanvas(options.width, options.height);
  const renderer = await rendererModule.createRenderer(canvas, {
      preferWebGL2: false,
      usePixmapPyramids: options.usePixmapPyramids,
      environmentAtlasManifestUrls: state.world?.atlasManifests || [],
      enemyCharacterUrls: defaultEnemyCharacterUrls(state),
      onProgress: ({ progress, label }) => { if (progress >= 0.92) console.error(label || "Renderer assets ready"); }
  });
  renderer.syncCaveWindow?.(caveWindowData.normalizeCaveWindow(state.world?.caveWindow));
  renderer.syncEnvironmentColorMap?.(state.world?.colorMap);
  if (options.prewarm) renderer.prewarmLevelPresentationCaches?.(state.world);
  let lastInputFrame = simulation.createInputFrame();
  let reqPos = 0;
  for (let index = 0; index < recording.frames.length && reqPos < indexed.length; index += 1) {
    const frame = recording.frames[index];
    const inputFrame = recordingTools.inputFrameFromSnapshot(frame.input || {});
    const fixedSteps = Math.max(0, Math.floor(Number(frame.fixedSteps) || 0));
    for (let step = 0; step < fixedSteps; step += 1) {
      simulation.stepSimulation(state, simulation.createSubstepInputFrame(inputFrame, step), simulation.FIXED_DT);
    }
    const blend = Math.max(0, Math.min(1, Number(frame.interpolationBlend) || 0));
    simulation.preparePresentationFrame(state, blend);
    lastInputFrame = inputFrame;
    while (reqPos < indexed.length && indexed[reqPos].index <= index) {
      renderer.render(state, lastInputFrame, recordingTools.recordingFrameDtSeconds(frame));
      await fs.mkdir(path.dirname(indexed[reqPos].output), { recursive: true });
      if (typeof canvas.toFile === 'function') await canvas.toFile(indexed[reqPos].output); else await canvas.saveAs(indexed[reqPos].output);
      console.log(JSON.stringify({ index, recordingTimeSec: frame.recordingTimeSec, output: indexed[reqPos].output }));
      reqPos += 1;
    }
  }
}
main().catch((error) => { console.error(error?.stack || error?.message || String(error)); process.exitCode = 1; });
