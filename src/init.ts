import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

export function initializeProjectInCurrentDirectory(): void {
    if (fs.readdirSync(".").length > 0) {
        console.error("Not creating project in current directory. Files already exist here.");
    } else {
        const templateProjectPath = path.resolve(__dirname, "../project");
        fs.copyFileSync(path.join(templateProjectPath, "tsconfig.json"), "tsconfig.json");
        fs.mkdirSync("src");
        fs.copyFileSync(path.join(templateProjectPath, "src/main.ts"), "src/main.ts");
        execSync("yarn init --yes");
        execSync("yarn add -D love-typescript-definitions lua-types typescript-to-lua");
    }
}
