import * as tstl from "typescript-to-lua";
import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import * as rimraf from "rimraf";
import { spawn } from "child_process";

export function getFullConfigFilePath(pathToProjectDirectory: string): string {
    const tsconfig = path.basename(pathToProjectDirectory) === "tsconfig.json"
        ? pathToProjectDirectory
        : path.join(pathToProjectDirectory, "tsconfig.json");
    return path.resolve(path.join(process.cwd(), tsconfig));
}

export function setupTemporaryDirectory(): string {
    const outDir = path.resolve(fs.mkdtempSync("lovets"));
    const contentDirectory = path.join(outDir, "res");
    if (fs.existsSync(contentDirectory)) {
        fs.symlinkSync(contentDirectory, path.join(outDir, "res"));
    }
    return outDir;
}

export function findAndParseConfigFile(configPath: string): [string, tstl.ParsedCommandLine] {
    const directory = path.posix.normalize(path.dirname(configPath));
    const configFilePath = ts.findConfigFile(directory, ts.sys.fileExists);
    const configParseResult = ts.parseJsonSourceFileConfigFileContent(
        ts.readJsonConfigFile(configFilePath, ts.sys.readFile),
        ts.sys,
        path.dirname(configFilePath),
        undefined,
        configFilePath
    );

    return [configFilePath, configParseResult];
}

export function transpileAndExecute(configPath: string): void {
    const outDir = setupTemporaryDirectory();
    const [, parsedConfigFile] = findAndParseConfigFile(configPath);
    parsedConfigFile.options.outDir = outDir;
    parsedConfigFile.options.project = configPath;
    parsedConfigFile.options.sourceMapTraceback = true;

    const program = ts.createProgram({
        rootNames: parsedConfigFile.fileNames,
        options: parsedConfigFile.options
    });

    const { transpiledFiles, diagnostics: transpileDiagnostics } = tstl.transpile({ program });

    const diagnostics = ts.sortAndDeduplicateDiagnostics([
        ...ts.getPreEmitDiagnostics(program),
        ...transpileDiagnostics,
    ]);

    const reportDiagnostic = tstl.createDiagnosticReporter(true);
    diagnostics.forEach(reportDiagnostic);

    const emitResult = tstl.emitTranspiledFiles(program.getCompilerOptions(), transpiledFiles);
    emitResult.forEach(({ name, text }) => {
        ts.sys.writeFile(name, text);
    });

    const child = spawn("lovec", [outDir], { stdio: [process.stdin, process.stdout, process.stderr] });
    child.on("close", function () {
        rimraf(outDir, {}, () => {});
    });
}
