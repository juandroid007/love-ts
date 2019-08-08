#!/usr/bin/env node --harmony
import { initializeProjectInCurrentDirectory } from "./init";
import { getFullConfigFilePath, buildProject } from "./build";
import { transpileAndExecute } from "./start";
import * as fs from "fs";
import * as tstl from "typescript-to-lua";
import * as path from "path";
import { transpileExecuteAndWatch } from "./watch";
import { createLoveFile } from "./release";
import { exec, spawn } from "child_process";

const [, , command, ...options] = process.argv;

const help = `
Syntax:     love-ts [command]

Commands:
add                             Add one or more dependencies (alias for "yarn add").
build                           Builds the project in the specified directory (alias for "yarn build").
init                            Initializes a new project within the current directory.
install                         Installs all of a project's dependencies (alias for "yarn install").
release                         Create a .love file with all compiled lua files, resource files and dependencies.
start (default)                 Starts the project within the current directory.
remove                          Remove one or more dependencies (alias for "yarn remove").
test                            Runs the tests for this project specified in package.json (alias for "yarn test").
watch                           Starts the project and updates source files while the game is running.
`;

// Unsupported commands:
// doctor                                   Interactively troubleshoot a project.

switch (command) {

    case "add": {
        const child = spawn("yarn", ["add", ...options], { stdio: [process.stdin, process.stdout, process.stderr] });

        let error = false;
        child.on("error", err => {
            console.error(err);
            error = true;
        });

        child.on("close", () => {
            if (!error) {
                options.forEach(option => {
                    if (option[0] !== "-") {
                        console.log(`Added package "${option}".`);
                        console.log(`No typing information is available for this module "${option}".`);
                        console.log(`Use "import * as ${option} from "${option}";" to import this module.`);
                    }
                });
            }
        });
        break;
    }

    case "build": {
        exec("yarn build");
        break;
    }

    case "init": {
        initializeProjectInCurrentDirectory();
        break;
    }

    case "install": {
        exec("yarn");
        break;
    }

    case "release": {
        const [configSearchPath = "."] = options;
        if (options.includes("-l") || options.includes("--library")) {
            const initFilePath = path.join(process.cwd(), "src", "init.ts");
            if (!fs.existsSync(initFilePath)) {
                console.warn("init.ts does not exist. Library members should be exported from this file.");
            }
            buildProject(configSearchPath, {
                options: {
                    luaLibImport: tstl.LuaLibImportKind.None,
                    noHeader: true,
                    declaration: true,
                    declarationDir: "dist",
                    outDir: path.basename(process.cwd())
                },
                writeLuaConfHead: false
            });
        } else {
            createLoveFile(configSearchPath);
        }
        break;
    }

    case "start": {
        const [configSearchPath = "."] = options;
        const fullPath = getFullConfigFilePath(configSearchPath);
        transpileAndExecute(fullPath);
        break;
    }

    case "remove": {
        exec(`yarn remove ${options.join(" ")}`);
        break;
    }

    case "test": {
        exec("yarn test");
        break;
    }

    case "watch": {
        const [configSearchPath = "."] = options;
        const fullPath = getFullConfigFilePath(configSearchPath);
        transpileExecuteAndWatch(fullPath);
        break;
    }

    case undefined: {
        if (fs.existsSync("tsconfig.json")) {
            const fullPath = getFullConfigFilePath(".");
            transpileAndExecute(fullPath);
            break;
        } else {
            console.error("Could not find tsconfig.json in current directory.");
        }
    }

    default: {
        console.error(`Unknown command "${command}".`)
    }

    case "-h":
    case "--help":
    case "help": {
        console.log(help);
        break;
    }

}
