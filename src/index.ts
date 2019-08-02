#!/usr/bin/env node --harmony
import { startProjectFromPath } from "./init";
import * as fs from "fs";

const [, , command, ...options] = process.argv;

const help = `
Syntax:     love-ts [command] [options...]
            love-ts [path]

Examples:   love-ts                         Start the project within the current directory.
            love-ts ./path/to/directory     Start the project within another directory.

Commands:
start [path]                                Starts a project. At the specified path (cwd by default).
`;

// Unsupported commands:
// init                                     Initializes a new project within the current directory.
// install                                  Installs the dependencies of the project within the current directory.
// build                                    Builds a project.
// build --release                          Builds a project in release mode.
// watch                                    Builds a project. Hot reloads changes made to .ts files.
// test                                     Builds a project and executes its testing scripts.
// doctor                                   Interactively troubleshoot a project.

switch (command) {

    case "start": {
        const [path = "."] = options;
        startProjectFromPath(path);
        break;
    }

    case undefined: {
        if (fs.existsSync("tsconfig.json")) {
            startProjectFromPath(".");
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
        startProjectFromPath(pathToProjectDirectory);
        break;
    }

}
