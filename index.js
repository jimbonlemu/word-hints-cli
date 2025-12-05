#!/usr/bin/env node
import readline from "readline";
import { loadConfig, saveConfig } from "./lib/config.js";
import { searchByPrefix } from "./lib/search.js";
import { printResults } from "./lib/printers/index.js";
import { handleCommand } from "./lib/commands.js";
import { printHeader } from "./lib/ui.js";
import { truncate } from "./lib/utils/truncate.js";

let config = loadConfig(); // single source of truth

// === CHECK FOR DIRECT SEARCH MODE ===
const args = process.argv.slice(2); 

if (args.length > 0) {
  const query = args[0];

  // Handle flags
  if (query === "--help" || query === "-h") {
    console.log(`
Word Hunts CLI v0.1.0

USAGE:
  wh [query]           Search for words starting with [query]
  wh                   Start interactive mode
  
OPTIONS:
  --help, -h           Show this help
  --version, -v        Show version
  
EXAMPLES:
  wh cat               Search words starting with "cat"
  wh                   Start interactive mode
    `);
    process.exit(0);
  }

  if (query === "--version" || query === "-v") {
    console.log("word-hunts-cli v0.1.0");
    process.exit(0);
  }

  // Direct search mode
  const results = searchByPrefix(query, config);
  const limited = results.slice(0, config.MAX_RESULTS);

  if (limited.length === 0) {
    console.log(`No words found starting with "${query}"`);
    process.exit(0);
  }

  console.log(`Results for "${query}" (${limited.length}/${results.length}):\n`);
  printResults(limited, config.COLUMNS, config.CELL_WIDTH, config.TABLE_MODE, truncate);
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// setters: operate directly on config (no duplicate vars)
const setters = {
  setMaxResults: (v) => { config.MAX_RESULTS = v; },
  setColumns:    (v) => { config.COLUMNS = v; },
  setCellWidth:  (v) => { config.CELL_WIDTH = v; },
  saveConfig:    () => saveConfig(config)
};

printHeader(config);

function ask() {
  rl.question("Type a command or search >> ", (input) => {
    const cmd = input.trim();

    if (!cmd) return ask();

    if (cmd.toLowerCase() === "/q") {
      console.log("Babayo!");
      rl.close();
      return;
    }

    if (cmd.toLowerCase() === "getui") {
      printHeader(config);
      return ask();
    }

    // command handling (registry)
    const result = handleCommand(cmd.toLowerCase(), config, setters);
    if (result.done) {
      // print updated UI from current in-memory config
      console.log();
      printHeader(config);
      console.log(result.msg);
      console.log();
      return ask();
    }

    // normal search
    const results = searchByPrefix(cmd, config); // now takes config for possible optimizations
    const limited = results.slice(0, config.MAX_RESULTS);

    console.log(`\nResult for "${cmd}" (showing ${limited.length} from ${results.length}):\n`);
    printResults(limited, config.COLUMNS, config.CELL_WIDTH, config.TABLE_MODE, truncate);
    console.log(`\nResult total: ${results.length}\n`);

    ask();
  });
}

ask();
