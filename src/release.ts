import * as archiver from "archiver";
import * as path from "path";
import * as fs from "fs";
import * as rimraf from "rimraf";
import { buildProject } from "./build";

function getOutputLoveFileName(): string {
    let gameName = "game";
    const expectedPackagePath = path.resolve("package.json");
    if (fs.existsSync(expectedPackagePath)) {
        gameName = require(expectedPackagePath).name;
    }
    return `${gameName}.love`;
}

export function createLoveFile(configPath: string): void {
    const outputFileName = getOutputLoveFileName();

    const outDir = buildProject(configPath, { sourceMapTraceback: false, linkResourcesDirectory: false });
    const output = fs.createWriteStream(outputFileName);
    const archive = archiver("zip");
    archive.pipe(output);
    archive.directory(outDir, false);
    archive.directory(path.join(configPath, "res"), "res");
    archive.finalize();
    output.on("close", () => {
        rimraf(outDir, {}, () => {});
        console.log(`Created ${outputFileName} (${archive.pointer()} bytes)`);
    });
}