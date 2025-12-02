import fs from "fs";
import path from "path";
import { __dirname } from "./utils/path.js";

const configPath = path.join(__dirname, "../../data/config.json");

let defaultConfig = {
    TABLE_MODE: true,
    MAX_RESULTS: 100,
    COLUMNS: 15,
    CELL_WIDTH: 12
};

export function loadConfig() {
    if (fs.existsSync(configPath)) {
        try {
            const raw = fs.readFileSync(configPath, "utf8");
            const parsed = JSON.parse(raw);
            defaultConfig = { ...defaultConfig, ...parsed };
            return defaultConfig;
        } catch (e) {
            console.error("Error reading config.json, using defaults.", e);
            return defaultConfig;
        }
    } else {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }
}

export function saveConfig(newConfig) {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
}
