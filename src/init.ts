import * as tstl from "typescript-to-lua";
import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import * as rimraf from "rimraf";
import { spawn } from "child_process";

transpileAndExecute(process.argv[2]);

export function transpileAndExecute(configPath: string): void {
    const outDir = path.resolve(fs.mkdtempSync("lovets"));
    const options: tstl.CompilerOptions = {
        noLib: true,
        project: configPath,
        outDir,
        sourceMapTraceback: true
    };

    const directory = path.dirname(path.join(ts.sys.getCurrentDirectory(), configPath));
    const searchPath = path.posix.normalize(directory);
    const configFilePath = ts.findConfigFile(searchPath, ts.sys.fileExists);
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
