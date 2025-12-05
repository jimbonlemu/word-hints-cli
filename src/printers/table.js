export function printTable(list, columns, width, truncate) {
  const cell = "-".repeat(width);
  const line = "+" + (cell + "+").repeat(columns);
  console.log(line);

  let row = "|";

  list.forEach((word, i) => {
    const w = truncate(word.toUpperCase(), width);
    row += w.padEnd(width, " ") + "|";

    if ((i + 1) % columns === 0) {
      console.log(row);
      console.log(line);
      row = "|";
    }
  });

  if (row !== "|") {
    console.log(row);
    console.log(line);
  }
}
