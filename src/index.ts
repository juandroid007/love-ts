#!/usr/bin/env node --harmony
import { initializeProjectInCurrentDirectory } from "./init";
import { getFullConfigFilePath } from "./build";
import { transpileAndExecute } from "./start";
import * as fs from "fs";
import { transpileExecuteAndWatch } from "./watch";
import { createLoveFile } from "./release";
import { exec } from "child_process";

const [, , command, ...options] = process.argv;

const help = `
Syntax:     love-ts [command]

Commands:
build                           Builds the project in the specified directory (alias for "yarn build").
init                            Initializes a new project within the current directory.
install                         Installs all of a project's dependencies (alias for "yarn install").
release                         Create a .love file with all compiled lua files, resource files and dependencies.
start (default)                 Starts the project within the current directory.
test                            Runs the tests for this project specified in package.json (alias for "yarn test").
watch                           Starts the project and updates source files while the game is running.
`;

// Unsupported commands:
// doctor                                   Interactively troubleshoot a project.

switch (command) {

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
        const [path = "."] = options;
        createLoveFile(path);
        break;
    }

    case "start": {
        const [path = "."] = options;
        const fullPath = getFullConfigFilePath(path);
        transpileAndExecute(fullPath);
        break;
    }

    case "test": {
        exec("yarn test");
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
