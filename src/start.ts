import * as rimraf from "rimraf";
import { spawn } from "child_process";
import { buildProject } from "./build";

export function transpileAndExecute(configPath: string): void {
    const outDir = buildProject(configPath, {});

    startLoveProgram(outDir);
}

export function startLoveProgram(directory: string, closeCallback?: () => void): void {
    const child = spawn("love", ["--console", directory], { stdio: [process.stdin, process.stdout, process.stderr] });

    child.on("close", function () {
        if (closeCallback) {
            closeCallback();
        }
        rimraf(directory, {}, () => {});
    });
}
