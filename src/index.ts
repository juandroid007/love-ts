#!/usr/bin/env node --harmony
import { initializeProjectInCurrentDirectory } from "./init";
import { getFullConfigFilePath } from "./build";
import { transpileAndExecute } from "./start";
import * as fs from "fs";
import { transpileExecuteAndWatch } from "./watch";
import { createLoveFile } from "./release";

const [, , command, ...options] = process.argv;

const help = `
Syntax:     love-ts [command] [options...]
            love-ts [path]

Examples:   love-ts                         Start the project within the current directory.
            love-ts ./path/to/directory     Start the project within another directory.

Commands:
init                                        Initializes a new project within the current directory.
start [path]                                Starts a project at the specified path (cwd by default).
watch [path]                                Starts a project and updates source files while the game is running.
release                                     Create a .love file with all compiled lua and resource files.
`;

// Unsupported commands:
// install                                  Installs the dependencies of the project within the current directory.
// build                                    Builds a project.
// test                                     Builds a project and executes its testing scripts.
// doctor                                   Interactively troubleshoot a project.

switch (command) {

    case "init": {
        initializeProjectInCurrentDirectory();
        break;
    }

    case "start": {
        const [path = "."] = options;
        const fullPath = getFullConfigFilePath(path);
        transpileAndExecute(fullPath);
        break;
    }

    case "release": {
        const [path = "."] = options;
        createLoveFile(path);
        break;
    }

    case "watch": {
        const [path = "."] = options;
        const fullPath = getFullConfigFilePath(path);
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

    case "-h":
    case "--help":
    case "help": {
        console.log(help);
        break;
    }

    default: {
        const pathToProjectDirectory = command;
        const fullPath = getFullConfigFilePath(pathToProjectDirectory);
        transpileAndExecute(fullPath);
        break;
    }

}
