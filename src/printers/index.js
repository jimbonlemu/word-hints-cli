import { printTable } from "./table.js";
import { printPlain } from "./plain.js";

export function printResults(list, columns, width, tableMode, truncate) {
  const termWidth = process.stdout.columns || 80;
  const dynamicCols = Math.max(1, Math.floor(termWidth / Math.max(1, width)));
  const useCols = Math.min(columns, dynamicCols);

  if (tableMode) printTable(list, useCols, width, truncate);
  else printPlain(list, useCols, width, truncate);
}
