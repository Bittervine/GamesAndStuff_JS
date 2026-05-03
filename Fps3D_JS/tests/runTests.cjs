const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { fileURLToPath, pathToFileURL } = require('node:url');

const projectRoot = globalThis.__projectRoot || path.resolve(process.cwd(), '.');
const moduleCache = new Map();
const builtinCache = new Map();

function resolveModulePath(specifier, parentPath) {
  const basePath = parentPath ? path.dirname(parentPath) : projectRoot;

  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    return path.resolve(basePath, specifier);
  }

  throw new Error(`Unsupported import specifier: ${specifier}`);
}

async function loadBuiltinModule(specifier) {
  if (builtinCache.has(specifier)) {
    return builtinCache.get(specifier);
  }

  const namespace = await import(specifier);
  const exportNames = Object.keys(namespace);
  const module = new vm.SyntheticModule(
    exportNames,
    function () {
      for (const exportName of exportNames) {
        this.setExport(exportName, namespace[exportName]);
      }
    },
    { identifier: specifier }
  );

  builtinCache.set(specifier, module);
  await module.link(() => {
    throw new Error(`Builtin module ${specifier} should not import further modules`);
  });
  await module.evaluate();
  return module;
}

async function loadModule(filePath) {
  const absolutePath = path.resolve(filePath);

  if (moduleCache.has(absolutePath)) {
    return moduleCache.get(absolutePath);
  }

  const source = fs.readFileSync(absolutePath, 'utf8');
  const fileUrl = pathToFileURL(absolutePath);
  const module = new vm.SourceTextModule(source, {
    identifier: fileUrl.href,
    initializeImportMeta(meta) {
      meta.url = fileUrl.href;
    }
  });

  moduleCache.set(absolutePath, module);

  await module.link(async (specifier, referencingModule) => {
    if (specifier.startsWith('node:')) {
      return loadBuiltinModule(specifier);
    }

    if (specifier.startsWith('file:')) {
      return loadModule(fileURLToPath(specifier));
    }

    const parentPath = fileURLToPath(referencingModule.identifier);
    return loadModule(resolveModulePath(specifier, parentPath));
  });

  await module.evaluate();
  return module;
}

function collectTestFiles(rootDir) {
  const out = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.test.js')) {
        out.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return out.sort((a, b) => a.localeCompare(b));
}

async function main() {
  const testFiles = collectTestFiles(path.join(projectRoot, 'tests'));

  for (const filePath of testFiles) {
    try {
      await loadModule(filePath);
    } catch (error) {
      console.error('FAIL', path.relative(projectRoot, filePath));
      console.error(error && error.stack ? error.stack : error);
      process.exitCode = 1;
    }
  }

  if (!process.exitCode) {
    console.log('Test suite complete.');
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
