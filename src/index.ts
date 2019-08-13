#!/usr/bin/env node --harmony
import { initializeProjectInCurrentDirectory, initializeTypingsInCurrentDirectory } from "./init";
import { getFullConfigFilePath, buildProject } from "./build";
import { transpileAndExecute, startLoveProgram, isStartableDirectory } from "./start";
import * as fs from "fs";
import * as tstl from "typescript-to-lua";
import * as path from "path";
import { transpileExecuteAndWatch } from "./watch";
import { createLoveFile } from "./release";
import { exec } from "child_process";

const options = [];
const nonFlags = process.argv.splice(2).filter(argument => {
    if (argument.startsWith("-")) {
        options.push(argument);
    } else {
        return argument;
    }
});

const [command, ...remainingArguments] = nonFlags;

const verbose = options.includes("-v") || options.includes("--verbose");
const keepOutput = options.includes("-k") || options.includes("--keep");

const help = `
Syntax:     love-ts [command]

Examples:   love-ts init        Initialize a new project in the current directory.
            love-ts .           Launch the project within the current directory.

Commands:
build                           Builds the project in the specified directory (alias for "yarn build").
init                            Initializes a new project within the current directory.
install                         Installs all of a project's dependencies (alias for "yarn install").
release                         Create a .love file with all compiled lua files, resource files and dependencies.
start (default)                 Starts the project within the current directory.
watch                           Starts the project and updates source files while the game is running.
`;

// Unsupported commands:
// doctor                                   Interactively troubleshoot a project.

switch (command) {

    case "build": {
        const [directory = ".", outDir] = remainingArguments;
        if (fs.existsSync(directory)) {
            buildProject(directory, {
                options: {
                    outDir,
                },
                writeLuaConfHead: false
            });
        } else {
            console.error(`Directory "${directory}" does not exist.`);
        }
        break;
    }

    case "init": {
        const typingsOnly = options.includes("-t") || options.includes("--typings");
        if (typingsOnly) {
            initializeTypingsInCurrentDirectory();
        } else {
            initializeProjectInCurrentDirectory();
        }
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

    default: {
        if (!fs.existsSync(command)) {
            console.error(`Unknown command "${command}".`);
            break;
        }
        options.unshift(command);
    }

    case "start": {
        const [directory = "."] = remainingArguments;
        if (isStartableDirectory(directory)) {
            transpileAndExecute(directory, { verbose, doNotDelete: keepOutput });
        } else {
            console.error(`Could not find tsconfig.json, main.ts or main.lua in directory "${command}".`);
            startLoveProgram({ verbose });
        }
        break;
    }

    case "watch": {
        const [configSearchPath = "."] = options;
        const fullPath = getFullConfigFilePath(configSearchPath);
        if (fs.existsSync(fullPath)) {
            transpileExecuteAndWatch(fullPath);
        } else {
            console.error(`Could not find tsconfig.json.`); +
            console.error(`Use "love-ts init" to create the minimum project structure needed.`);
        }
        break;
    }

    case undefined: {
        startLoveProgram({ verbose });
        break;
    }

    case "-h":
    case "--help":
    case "help": {
        console.log(help);
        break;
    }

}
