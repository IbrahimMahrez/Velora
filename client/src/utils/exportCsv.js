// ======================================================
// CSV EXPORT
// Central helper: toCsv(rows) with \uFEFF BOM + proper
// quoting, downloadCsv(filename, rows).
// rows: array of objects with identical keys, OR
// array of arrays (first row = header).
// ======================================================

function escapeCell(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return "\uFEFF";

  let header = [];
  let dataRows = [];

  if (Array.isArray(rows[0])) {
    header = rows[0];
    dataRows = rows.slice(1);
  } else {
    const keys = [];
    rows.forEach((row) => {
      Object.keys(row || {}).forEach((k) => {
        if (!keys.includes(k)) keys.push(k);
      });
    });
    header = keys;
    dataRows = rows.map((row) => keys.map((k) => row?.[k]));
  }

  const lines = [
    header.map(escapeCell).join(","),
    ...dataRows.map((r) => r.map(escapeCell).join(",")),
  ];

  return "\uFEFF" + lines.join("\r\n");
}

export function downloadCsv(filename, rows) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function datedFilename(prefix) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${prefix}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.csv`;
}

export default { toCsv, downloadCsv, datedFilename };
