import * as tstl from "typescript-to-lua";
import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import * as rimraf from "rimraf";
import { spawn } from "child_process";

export function startProjectFromPath(pathToProjectDirectory: string): void {
    const tsconfig = path.basename(pathToProjectDirectory) === "tsconfig.json"
        ? pathToProjectDirectory
        : path.join(pathToProjectDirectory, "tsconfig.json");
    const configFilePath = path.resolve(path.join(process.cwd(), tsconfig));
    transpileAndExecute(configFilePath);
}

export function transpileAndExecute(configPath: string): void {
    const outDir = path.resolve(fs.mkdtempSync("lovets"));
    const options: tstl.CompilerOptions = {
        noLib: true,
        project: configPath,
        outDir,
        sourceMapTraceback: true
    };

    const directory = path.posix.normalize(path.dirname(configPath));
    const configFilePath = ts.findConfigFile(directory, ts.sys.fileExists);
    const configParseResult = ts.parseJsonSourceFileConfigFileContent(
        ts.readJsonConfigFile(configFilePath, ts.sys.readFile),
        ts.sys,
        path.dirname(configFilePath),
        options,
        configFilePath
    );

    const program = ts.createProgram({
        rootNames: configParseResult.fileNames,
        options: configParseResult.options
    });

    const transpileResult = tstl.transpile({
        program: program
    });

    const emitResult = tstl.emitTranspiledFiles(program.getCompilerOptions(), transpileResult.transpiledFiles);
    emitResult.forEach(({ name, text }) => {
        ts.sys.writeFile(name, text);
    });

    const child = spawn("lovec", [outDir], { stdio: [process.stdin, process.stdout, process.stderr] });
    child.on("close", function () {
        rimraf(outDir, {}, () => {});
    });
}
