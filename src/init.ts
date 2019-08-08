import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

export function initializeProjectInCurrentDirectory(): void {
    if (fs.readdirSync(".").length > 0) {
        console.error("Not creating project in current directory. Files already exist here.");
    } else {
        const directoryName = path.basename(process.cwd());
        const templateProjectPath = path.resolve(__dirname, "../project");
        fs.copyFileSync(path.join(templateProjectPath, "tsconfig.json"), "tsconfig.json");
        const tsconfigJson = JSON.parse(fs.readFileSync("tsconfig.json").toString());
        tsconfigJson.compilerOptions.outDir = directoryName;
        fs.writeFileSync("tsconfig.json", JSON.stringify(tsconfigJson));
        fs.mkdirSync("src");
        fs.mkdirSync("res");
        fs.copyFileSync(path.join(templateProjectPath, "src/main.ts"), "src/main.ts");
        execSync("yarn init --yes");
        const packageJson = JSON.parse(fs.readFileSync("package.json").toString());
        delete packageJson.main;
        packageJson.types = `${directoryName}/init.d.ts`;
        packageJson.scripts = {};
        packageJson.scripts.build = "tstl -p tsconfig.json";
        fs.writeFileSync("package.json", JSON.stringify(packageJson));
        execSync("yarn add -D love-typescript-definitions lua-types typescript-to-lua");
    }
}
