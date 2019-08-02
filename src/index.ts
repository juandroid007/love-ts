#!/usr/bin/env node --harmony
import * as program from "commander";
console.log(process.argv);
program
    .version("0.0.1")
    .command("init", "Initialize a project in the current directory.")
    .action(() => {
        console.log("Initialize");
    });

program.parse(process.argv);
