#!/usr/bin/env node
import readline from "readline";

// Core modules
import { loadConfig, saveConfig } from "./src/core/config.js";
import { searchByPrefix } from "./src/core/search.js";

// Constants
import { CLI_VERSION, QUIT_COMMANDS, REFRESH_UI_COMMANDS, CHECK_VERSION_COMMANDS, HELP_COMMANDS, LANGUAGE_COMMANDS } from "./src/core/constants.js";

// UI and printing
import { printResults } from "./src/printers/index.js";
import { printHeader } from "./src/ui/index.js";

// Commands
import { handleCommand } from "./src/commands/index.js";

// Utilities
import { truncate } from "./src/utils/truncate.js";

// i18n
import { setLanguage, t } from "./src/i18n/index.js";

let config = loadConfig(); // single source of truth

// Set language from config
setLanguage(config.LANGUAGE);

// === COMMAND LINE ARGUMENTS HANDLER ===
function handleCommandLineArgs() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    const query = args[0];

    // Handle flags
    if (query === "--help" || query === "-h") {
      console.log(generateUsage());
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
    console.log(`${t('no_words_found')} "${query}"`);
    return;
  }

  console.log(`${t('results_for')} "${query}" (${limited.length}/${results.length}):\n`);
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
    rl.question(t('interactive_prompt'), (input) => {
      const cmd = input.trim();

      if (!cmd) return ask();

      if (QUIT_COMMANDS.includes(cmd.toLowerCase())) {
        console.log(t('quit_command'));
        rl.close();
        return;
      }

      if (CHECK_VERSION_COMMANDS.includes(cmd.toLowerCase())) {
        console.log(CLI_VERSION,"\n");
        return ask();
      }

       if (HELP_COMMANDS.includes(cmd.toLowerCase())) {
        console.log(generateUsage(),"\n");
        return ask();
      }

      // Language command
      if (LANGUAGE_COMMANDS.includes(cmd.split(' ')[0].toLowerCase())) {
        const parts = cmd.split(' ');
        if (parts.length === 2) {
          const lang = parts[1].toLowerCase();
          if (['en', 'id'].includes(lang)) {
            config.LANGUAGE = lang;
            setLanguage(lang);
            saveConfig(config);
            console.log(`\n${t('language_changed', lang)}\n`);
            printHeader(config);
          } else {
            console.log(`\n${t('supported_languages')}: en, id\n`);
          }
        } else {
          console.log(`\n${t('supported_languages')}: en, id\n`);
        }
        return ask();
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

  console.log(`\n${t('results_for')} "${query}" (${t('showing_results')} ${limited.length} ${t('from')} ${results.length}):\n`);
  printResults(limited, config.COLUMNS, config.CELL_WIDTH, config.TABLE_MODE, truncate);
  console.log(`\n${t('result_total')} ${results.length}\n`);
}

function generateUsage() {
  return `${t('app_name')} v0.3.1\n
${t('usage_title')}
  wh [query]           ${t('usage_direct_search')}
  wh                   ${t('usage_interactive')}

${t('options_title')}
  --help, -h           ${t('options_help')}
  --version, -v        ${t('options_version')}

${t('interactive_commands_title') || 'INTERACTIVE COMMANDS'}
  <prefix>             ${t('interactive_command_prefix')}
  table on/off         ${t('interactive_command_table')}
  tbon/tboff           ${t('interactive_command_table_aliases')}
  /lang, /language     ${t('interactive_command_language')}
  sres <num>           ${t('interactive_command_result_limit')}
  scol <num>           ${t('interactive_command_columns')}
  scw <num>            ${t('interactive_command_cell_width')}
  getui, /refs, /ui    ${t('interactive_command_refresh')}
  /q, /quit, /exit     ${t('interactive_command_quit')}

${t('examples_title')}
  wh cat               ${t('examples_cat')}
  wh                   ${t('examples_interactive')}
`;
}

// === MAIN EXECUTION ===
handleCommandLineArgs();
startInteractiveMode();
