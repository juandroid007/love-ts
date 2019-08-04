import * as tstl from "typescript-to-lua";
import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";
import { luaConfHead } from "./watch";

export function getFullConfigFilePath(pathToProjectDirectory: string): string {
    const tsconfig = path.basename(pathToProjectDirectory) === "tsconfig.json"
        ? pathToProjectDirectory
        : path.join(pathToProjectDirectory, "tsconfig.json");
    return path.resolve(path.join(process.cwd(), tsconfig));
}

export function setupTemporaryDirectory(configPath: string, { linkResourcesDirectory = true }: {
    linkResourcesDirectory?: boolean;
}): string {
    const outDir = path.resolve(fs.mkdtempSync("lovets"));
    if (linkResourcesDirectory) {
        const contentDirectory = path.join(path.dirname(configPath), "res");
        if (fs.existsSync(contentDirectory)) {
            fs.symlinkSync(contentDirectory, path.join(outDir, "res"));
        } else {
            throw Error("Failed to link resource directory.");
        }
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

export function buildProject(configPath: string, { sourceMapTraceback = true, linkResourcesDirectory }: {
    sourceMapTraceback?: boolean;
    linkResourcesDirectory?: boolean;
}): string {
    const outDir = setupTemporaryDirectory(configPath, { linkResourcesDirectory });
    const [, parsedConfigFile] = findAndParseConfigFile(configPath);
    parsedConfigFile.options.outDir = outDir;
    parsedConfigFile.options.project = configPath;
    parsedConfigFile.options.sourceMapTraceback = sourceMapTraceback;

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

    let wroteConf = false;
    const emitResult = tstl.emitTranspiledFiles(program.getCompilerOptions(), transpiledFiles);
    emitResult.forEach(({ name, text }) => {
        switch (path.basename(name)) {
            case "conf.lua": {
                ts.sys.writeFile(name, `${luaConfHead}\n${text}`);
                wroteConf = true;
                break;
            }
            default: {
                ts.sys.writeFile(name, text);
                break;
            }
        }
    });

    if (!wroteConf) {
        ts.sys.writeFile(path.join(outDir, "conf.lua"), luaConfHead);
    }

    return outDir;
}