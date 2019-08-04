import * as archiver from "archiver";
import * as path from "path";
import * as fs from "fs";
import * as rimraf from "rimraf";
import { buildProject } from "./build";

function getPackageJson(): {
    name?: string;
    dependencies?: { [key: string]: string };
} | undefined {
    const expectedPackagePath = path.resolve("package.json");
    if (fs.existsSync(expectedPackagePath)) {
        return require(expectedPackagePath);
    }
}

export function createLoveFile(configPath: string): void {
    const packageJson = getPackageJson();
    const outputFileName = `${packageJson ? packageJson.name || "game" : "game"}.love`;

    const outDir = buildProject(configPath, { sourceMapTraceback: false, linkResourcesDirectory: false });
    const output = fs.createWriteStream(outputFileName);
    const archive = archiver("zip");
    archive.pipe(output);

    // Copy output Lua files
    archive.directory(outDir, false);

    // Copy items from resources directory
    archive.directory(path.join(configPath, "res"), "res");

    // Copy dependencies
    if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach(dependencyName => {
            const dependencyPath = path.resolve(path.join(configPath, "node_modules", dependencyName));
            archive.directory(dependencyPath, dependencyName);
        });
    }

    archive.finalize();
    output.on("close", () => {
        rimraf(outDir, {}, () => {});
        console.log(`Created ${outputFileName} (${archive.pointer()} bytes)`);
    });
}