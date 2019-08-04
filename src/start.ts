import * as rimraf from "rimraf";
import { spawn } from "child_process";
import { buildProject } from "./build";

export function transpileAndExecute(configPath: string): void {
    const outDir = buildProject(configPath, {});

    const child = spawn("lovec", [outDir], { stdio: [process.stdin, process.stdout, process.stderr] });
    child.on("close", function () {
        rimraf(outDir, {}, () => {});
    });
}
