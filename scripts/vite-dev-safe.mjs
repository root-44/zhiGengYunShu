import childProcess from "node:child_process";
import { EventEmitter } from "node:events";
import { syncBuiltinESMExports } from "node:module";
import { PassThrough } from "node:stream";
import { pathToFileURL } from "node:url";

export const VITE_REALPATH_BYPASS_NODE_VERSION = "18.9.0";

let installed = false;
let realpathBypassInstalled = false;

export function createViteNetUseSafeExec(originalExec) {
  return function viteNetUseSafeExec(command, options, callback) {
    const normalizedCommand =
      typeof command === "string" ? command.trim().toLowerCase() : "";

    if (process.platform === "win32" && normalizedCommand === "net use") {
      const child = createNoopChildProcess();
      const done = typeof options === "function" ? options : callback;

      queueMicrotask(() => {
        child.stdout.end();
        child.stderr.end();

        if (typeof done === "function") {
          done(null, "", "");
        }

        child.emit("exit", 0, null);
        child.emit("close", 0, null);
      });

      return child;
    }

    if (typeof options === "function") {
      return originalExec.call(this, command, options);
    }

    return originalExec.call(this, command, options, callback);
  };
}

export function installViteWindowsNetUsePatch() {
  if (installed || process.platform !== "win32") {
    return;
  }

  childProcess.exec = createViteNetUseSafeExec(childProcess.exec);
  syncBuiltinESMExports();
  installed = true;
}

export function installViteWindowsRealpathBypass() {
  if (realpathBypassInstalled || process.platform !== "win32") {
    return;
  }

  const [major, minor] = process.versions.node.split(".").map(Number);

  if (major > 18 || (major === 18 && minor >= 10)) {
    // Vite 5 probes Windows network drives via "net use" on newer Node.
    // Restricted shells can block that spawn; this keeps Vite on native realpath.
    Object.defineProperty(process.versions, "node", {
      value: VITE_REALPATH_BYPASS_NODE_VERSION,
      enumerable: true,
      configurable: true
    });
  }

  realpathBypassInstalled = true;
}

function createNoopChildProcess() {
  const child = new EventEmitter();
  child.stdin = null;
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.killed = false;
  child.kill = () => {
    child.killed = true;
    return true;
  };
  return child;
}

function isDirectRun() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isDirectRun()) {
  installViteWindowsRealpathBypass();
  installViteWindowsNetUsePatch();
  if (process.env.VITE_DEV_SAFE_DEBUG === "1") {
    console.error(
      `[vite-dev-safe] platform=${process.platform} node=${process.versions.node}`
    );
  }
  await import("../node_modules/vite/bin/vite.js");
}
