#!/usr/bin/env node
import readline from "readline";
import { loadConfig, saveConfig, CLI_USAGE, CLI_VERSION, QUIT_COMMANDS, REFRESH_UI_COMMANDS } from "./src/core/index.js";
import { searchByPrefix } from "./src/core/search.js";
import { printResults } from "./src/printers/index.js";
import { handleCommand } from "./src/commands/index.js";
import { printHeader } from "./src/ui/index.js";
import { truncate } from "./src/utils/truncate.js";

let config = loadConfig(); // single source of truth

// === COMMAND LINE ARGUMENTS HANDLER ===
function handleCommandLineArgs() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    const query = args[0];

    // Handle flags
    if (query === "--help" || query === "-h") {
      console.log(CLI_USAGE);
      process.exit(0);
    }

    if (query === "--version" || query === "-v") {
      console.log(CLI_VERSION);
      process.exit(0);
    }

    // Direct search mode
    performDirectSearch(query);
    process.exit(0);
  }
}

function performDirectSearch(query) {
  const results = searchByPrefix(query, config);
  const limited = results.slice(0, config.MAX_RESULTS);

  if (limited.length === 0) {
    console.log(`No words found starting with "${query}"`);
    return;
  }

  console.log(`Results for "${query}" (${limited.length}/${results.length}):\n`);
  printResults(limited, config.COLUMNS, config.CELL_WIDTH, config.TABLE_MODE, truncate);
}

// === INTERACTIVE MODE HANDLER ===
function startInteractiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  printHeader(config);

  function ask() {
    rl.question("Type a command or search >> ", (input) => {
      const cmd = input.trim();

      if (!cmd) return ask();

      if (QUIT_COMMANDS.includes(cmd.toLowerCase())) {
        console.log("Babayo!");
        rl.close();
        return;
      }

      if (REFRESH_UI_COMMANDS.includes(cmd.toLowerCase())) {
        printHeader(config);
        return ask();
      }

      // command handling (registry)
      const result = handleCommand(cmd.toLowerCase(), config, saveConfig);
      if (result.done) {
        // print updated UI from current in-memory config
        console.log();
        printHeader(config);
        console.log(result.msg);
        console.log();
        return ask();
      }

      // normal search
      performSearch(cmd);
      ask();
    });
  }

  ask();
}

function performSearch(query) {
  const results = searchByPrefix(query, config);
  const limited = results.slice(0, config.MAX_RESULTS);

  console.log(`\nResult for "${query}" (showing ${limited.length} from ${results.length}):\n`);
  printResults(limited, config.COLUMNS, config.CELL_WIDTH, config.TABLE_MODE, truncate);
  console.log(`\nResult total: ${results.length}\n`);
}

// === MAIN EXECUTION ===
handleCommandLineArgs();
startInteractiveMode();
