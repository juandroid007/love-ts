import * as rimraf from "rimraf";
import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { buildProject } from "./build";

export function isStartableDirectory(directory: string): boolean {
    return fs.existsSync(path.resolve(path.join(directory, "tsconfig.json"))) ||
        fs.existsSync(path.resolve(path.join(directory, "main.ts"))) ||
        fs.existsSync(path.resolve(path.join(directory, "main.lua")));
}

export function transpileAndExecute(directory: string, {
    verbose,
    doNotDelete
}: {
    verbose?: boolean;
    doNotDelete?: boolean;
}): void {
    const mainLuaPath = path.resolve(path.join(directory, "main.lua"));
    if (fs.existsSync(mainLuaPath)) {
        if (verbose) {
            console.log(`Found entry point "${mainLuaPath}".`);
        }
        startLoveProgram({ directory, verbose });
        return;
    }

    directory = buildProject(directory, {
        options: {
            sourceMapTraceback: true
        }
    });

    startLoveProgram({
        directory,
        verbose,
        closeCallback: () => {
            if (!doNotDelete) {
                if (verbose) {
                    console.log(`Removing "${directory}".`)
                }

                rimraf(directory, {}, err => {
                    if (err) {
                        throw err;
                    } else {
                        if (verbose) {
                            console.log(`Removed "${directory}".`);
                        }
                    }
                });
            }
        }
    });
}

export function startLoveProgram({
    directory,
    verbose,
    closeCallback
}: {
    directory?: string;
    verbose?: boolean;
    closeCallback?: () => void;
}): void {
    const parameters = ["--console", directory].filter(Boolean);

    if (verbose) {
        console.log(`Spawning "love ${parameters.join(" ")}".`);
    }

    const child = spawn("love", parameters, { stdio: [process.stdin, process.stdout, process.stderr] });

    if (closeCallback) {
        child.on("close", closeCallback);
    }
}
