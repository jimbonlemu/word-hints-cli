export function printPlain(list, columns, width, truncate) {
  let row = "";

  list.forEach((word, i) => {
    const w = truncate(word.toUpperCase(), width);
    row += w.padEnd(width, " ");

    if ((i + 1) % columns === 0) {
      console.log(row);
      row = "";
    }
  });

  if (row.trim() !== "") console.log(row);
}

