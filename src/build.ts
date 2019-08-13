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

export function setupTemporaryDirectory(projectPath: string, { linkResourcesDirectory = true }: {
    linkResourcesDirectory?: boolean;
}): string {
    const outDir = path.resolve(fs.mkdtempSync("lovets"));
    if (linkResourcesDirectory) {
        const contentDirectory = path.join(path.dirname(projectPath), "res");
        if (fs.existsSync(contentDirectory)) {
            fs.symlinkSync(contentDirectory, path.join(outDir, "res"), "junction");
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

export function buildProject(projectPath: string, {
    options = {},
    linkResourcesDirectory,
    writeLuaConfHead = true
}: {
    options?: tstl.CompilerOptions;
    linkResourcesDirectory?: boolean;
    writeLuaConfHead?: boolean;
}): string {
    const configPath = getFullConfigFilePath(projectPath);

    const outDir = options.outDir === undefined ?
        setupTemporaryDirectory(projectPath, { linkResourcesDirectory }) :
        options.outDir;

    let config: ts.ParsedCommandLine;
    if (fs.existsSync(configPath)) {
        [, config] = findAndParseConfigFile(configPath);
        config.options.project = configPath;
    } else {
        config = {
            fileNames: [path.resolve("main.ts")],
            options,
            errors: []
        };
    }

    Object.assign(config.options, options);

    config.options.outDir = outDir;
    config.options.lib = ["lib.esnext.d.ts"];
    config.options.types = [
        "love-typescript-definitions",
        "lua-types/jit"
    ];

    const host = ts.createCompilerHost(config.options);
    const program = ts.createProgram({
        host,
        rootNames: config.fileNames,
        options: config.options
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
                if (writeLuaConfHead) {
                    ts.sys.writeFile(name, `${luaConfHead}\n${text}`);
                } else {
                    ts.sys.writeFile(name, `${text}`);
                }
                wroteConf = true;
                break;
            }
            default: {
                ts.sys.writeFile(name, text);
                break;
            }
        }
    });

    if (!wroteConf && writeLuaConfHead) {
        ts.sys.writeFile(path.join(outDir, "conf.lua"), luaConfHead);
    }

    return outDir;
}