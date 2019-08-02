"use strict";
exports.__esModule = true;
var tstl = require("typescript-to-lua");
var ts = require("typescript");
var path = require("path");
var fs = require("fs");
var child_process_1 = require("child_process");
var _a = process.argv, projectPath = _a[2];
transpileAndExecute(projectPath);
function transpileAndExecute(configPath) {
    var outDir = path.resolve(fs.mkdtempSync("lovets"));
    var options = {
        noLib: true,
        project: configPath,
        outDir: outDir,
        sourceMapTraceback: true
    };
    var directory = path.dirname(path.join(ts.sys.getCurrentDirectory(), configPath));
    var searchPath = path.posix.normalize(directory);
    var configFilePath = ts.findConfigFile(searchPath, ts.sys.fileExists);
    var configParseResult = ts.parseJsonSourceFileConfigFileContent(ts.readJsonConfigFile(configFilePath, ts.sys.readFile), ts.sys, path.dirname(configFilePath), options, configFilePath);
    var program = ts.createProgram({
        rootNames: configParseResult.fileNames,
        options: configParseResult.options
    });
    var transpileResult = tstl.transpile({
        program: program
    });
    var emitResult = tstl.emitTranspiledFiles(program.getCompilerOptions(), transpileResult.transpiledFiles);
    emitResult.forEach(function (_a) {
        var name = _a.name, text = _a.text;
        ts.sys.writeFile(name, text);
    });
    var child = child_process_1.spawn("lovec", [outDir], { stdio: [process.stdin, process.stdout, process.stderr] });
    child.on("close", function () {
        // rimraf(outDir, {}, () => {});
    });
}
exports.transpileAndExecute = transpileAndExecute;
