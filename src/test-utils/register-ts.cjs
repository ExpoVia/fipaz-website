/* eslint-disable @typescript-eslint/no-require-imports -- Hook de Node para correr pruebas `node:test` sobre el código TypeScript. */
// Compila `.ts`/`.tsx` con el TypeScript del proyecto y resuelve el alias `@/` (→ `src/`), sin añadir
// un runner de pruebas. Uso: `require("../../test-utils/register-ts.cjs")` al inicio de un `*.test.cjs`.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const SRC_DIR = path.resolve(__dirname, "..");

function compile(module, filename) {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  module._compile(outputText, filename);
}

require.extensions[".ts"] = compile;
require.extensions[".tsx"] = compile;

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveWithAlias(request, ...rest) {
  const target = request.startsWith("@/") ? path.join(SRC_DIR, request.slice(2)) : request;
  return originalResolve.call(this, target, ...rest);
};
