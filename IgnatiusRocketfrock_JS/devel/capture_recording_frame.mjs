#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { installNodeCanvasAdapters, makeNodeCanvas } from "./node-canvas-adapters.mjs";

const develDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(develDir, "..");

function parseArgs(argv) {
    const options = {
        recording: "recordings/level_001_1.json",
        out: "devel/captures/recording-frame.png",
        frame: 0,
        width: 1280,
        height: 720,
        usePixmapPyramids: false,
        prewarm: true
    };
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        const [rawKey, inlineValue] = arg.startsWith("--") ? arg.slice(2).split("=", 2) : ["", ""];
        if (!rawKey) continue;
        const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        const value = inlineValue ?? argv[++i];
        if (key === "help") options.help = true;
        else if (key === "recording") options.recording = value;
        else if (key === "out") options.out = value;
        else if (key === "frame") options.frame = Math.max(0, Math.floor(Number(value) || 0));
        else if (key === "tick") options.tick = Math.max(0, Math.floor(Number(value) || 0));
        else if (key === "time") options.time = Math.max(0, Number(value) || 0);
        else if (key === "width") options.width = Math.max(1, Math.floor(Number(value) || options.width));
        else if (key === "height") options.height = Math.max(1, Math.floor(Number(value) || options.height));
        else if (key === "usePixmapPyramids") options.usePixmapPyramids = !["0", "false", "no", "off"].includes(String(value).toLowerCase());
        else if (key === "noPrewarm") options.prewarm = false;
        else throw new Error(`Unknown option --${rawKey}`);
    }
    return options;
}

function printHelp() {
    console.log(`Usage:
  node devel/capture_recording_frame.mjs --recording recordings/level_001_1.json --frame 180 --out /tmp/frame.png

Options:
  --recording <path>       Gameplay recording JSON, relative to the project root by default.
  --frame <index>          Recording frame index to render. Default: 0.
  --tick <tick>            Render the first recording frame at or after this simulation tick.
  --time <seconds>         Render the first recording frame at or after this recording time.
  --out <path>             PNG output path. Default: devel/captures/recording-frame.png.
  --width <pixels>         Canvas width. Default: 1280.
  --height <pixels>        Canvas height. Default: 720.
  --use-pixmap-pyramids 1  Enable pixmap pyramids for the capture renderer.
  --no-prewarm             Skip renderer prewarm caches.
`);
}

function resolveProjectPath(value) {
    const text = String(value || "");
    return path.isAbsolute(text) ? text : path.resolve(projectRoot, text);
}

function selectedFrameIndex(recording, options) {
    const frames = Array.isArray(recording.frames) ? recording.frames : [];
    if (options.tick != null) {
        const index = frames.findIndex((frame) => Number(frame.tick) >= options.tick);
        return index >= 0 ? index : frames.length - 1;
    }
    if (options.time != null) {
        const index = frames.findIndex((frame) => Number(frame.recordingTimeSec) >= options.time);
        return index >= 0 ? index : frames.length - 1;
    }
    return Math.min(Math.max(0, options.frame), Math.max(0, frames.length - 1));
}

function defaultEnemyCharacterUrls(state) {
    const fromWorld = state?.world?.enemyCharacterProjectUrls;
    return Array.isArray(fromWorld) ? fromWorld.map(String).filter(Boolean) : [];
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        printHelp();
        return;
    }

    installNodeCanvasAdapters({ root: projectRoot, width: options.width, height: options.height });

    const [simulation, recordingTools, rendererModule, caveWindowData] = await Promise.all([
        import(pathToFileURL(path.join(projectRoot, "src/core/simulation.js"))),
        import(pathToFileURL(path.join(projectRoot, "src/browser/gameplay-recording.js"))),
        import(pathToFileURL(path.join(projectRoot, "src/presentation/canvas-renderer.js"))),
        import(pathToFileURL(path.join(projectRoot, "src/shared/cave-window-data.js")))
    ]);

    const recordingPath = resolveProjectPath(options.recording);
    const recording = recordingTools.normalizeGameplayRecording(JSON.parse(await fs.readFile(recordingPath, "utf8")));
    const targetIndex = selectedFrameIndex(recording, options);
    const targetFrame = recording.frames[targetIndex] || null;
    if (!targetFrame) {
        throw new Error(`Recording ${recordingPath} has no frames to render.`);
    }

    const state = simulation.cloneGameState(recording.initialState);
    const canvas = makeNodeCanvas(options.width, options.height);
    const renderer = await rendererModule.createRenderer(canvas, {
        preferWebGL2: false,
        usePixmapPyramids: options.usePixmapPyramids,
        environmentAtlasManifestUrls: state.world?.atlasManifests || [],
        enemyCharacterUrls: defaultEnemyCharacterUrls(state),
        onProgress: ({ progress, label }) => {
            if (progress >= 0.92) console.error(label || "Renderer assets ready");
        }
    });

    renderer.syncCaveWindow?.(caveWindowData.normalizeCaveWindow(state.world?.caveWindow));
    renderer.syncEnvironmentColorMap?.(state.world?.colorMap, state.world?.colorExchange);
    if (options.prewarm) {
        renderer.prewarmLevelPresentationCaches?.(state.world);
    }

    let lastInputFrame = simulation.createInputFrame();
    let renderedFrame = null;
    for (let index = 0; index <= targetIndex; index += 1) {
        const frame = recording.frames[index];
        const inputFrame = recordingTools.inputFrameFromSnapshot(frame.input || {});
        const fixedSteps = Math.max(0, Math.floor(Number(frame.fixedSteps) || 0));
        for (let step = 0; step < fixedSteps; step += 1) {
            const stepInput = simulation.createSubstepInputFrame(inputFrame, step);
            simulation.stepSimulation(state, stepInput, simulation.FIXED_DT);
        }
        const blend = Math.max(0, Math.min(1, Number(frame.interpolationBlend) || 0));
        simulation.preparePresentationFrame(state, blend);
        lastInputFrame = inputFrame;
        renderedFrame = frame;
    }

    renderer.render(state, lastInputFrame, recordingTools.recordingFrameDtSeconds(renderedFrame));

    const outputPath = resolveProjectPath(options.out);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    if (typeof canvas.toFile === "function") {
        await canvas.toFile(outputPath);
    } else {
        await canvas.saveAs(outputPath);
    }

    const result = {
        outputPath,
        recording: path.relative(projectRoot, recordingPath),
        selectedFrameIndex: targetIndex,
        selectedFrame: {
            index: renderedFrame.index,
            recordingTimeSec: renderedFrame.recordingTimeSec,
            gameTimeSec: renderedFrame.gameTimeSec,
            tick: renderedFrame.tick,
            fixedSteps: renderedFrame.fixedSteps,
            interpolationBlend: renderedFrame.interpolationBlend
        },
        canvas: { width: canvas.width, height: canvas.height },
        state: {
            tick: state.clock?.tick || 0,
            time: state.clock?.time || 0,
            player: {
                x: state.player?.currentTransform?.x,
                y: state.player?.currentTransform?.y,
                shownX: state.player?.shownTransform?.x,
                shownY: state.player?.shownTransform?.y
            },
            camera: {
                x: state.camera?.currentTransform?.x,
                y: state.camera?.currentTransform?.y,
                shownX: state.camera?.shownTransform?.x,
                shownY: state.camera?.shownTransform?.y
            }
        }
    };
    console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exitCode = 1;
});
