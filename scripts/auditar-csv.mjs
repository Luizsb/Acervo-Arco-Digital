import { promises as fs } from "node:fs";
import { parse } from "csv-parse/sync";

const SRC = "./data/ACERVO_SAE.csv";

// ajuste os nomes exatos das colunas do seu CSV:
const C = {
  titulo: "Título",
  link: "Link Principal",
  status: "Status", // se não existir, deixe assim mesmo
};

const csv = await fs.readFile(SRC, "utf8");
const rows = parse(csv, { columns: true, skip_empty_lines: false });

const totalCSV = rows.length;

// helpers
const norm = s => (s ?? "").toString().trim();
const slug = s => norm(s).toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let semTitulo = [], semLink = [], naoPublicado = [], duplicadoSlug = [];
const seen = new Set();

rows.forEach((r, i) => {
  const t = norm(r[C.titulo]);
  const u = norm(r[C.link]);
  const st = r[C.status] ? norm(r[C.status]).toLowerCase() : "publicado";
  if (!t) semTitulo.push(i + 2); // +2: cabeçalho + base 1
  if (!u) semLink.push(i + 2);
  if (st && st !== "publicado") naoPublicado.push({ linha: i + 2, status: st });
  const s = slug(t);
  if (s) {
    if (seen.has(s)) duplicadoSlug.push({ linha: i + 2, slug: s });
    else seen.add(s);
  }
});

console.log(`Linhas no CSV: ${totalCSV}`);
console.log(`Sem título: ${semTitulo.length} ${semTitulo.length ? "(linhas " + semTitulo.join(", ") + ")" : ""}`);
console.log(`Sem link: ${semLink.length} ${semLink.length ? "(linhas " + semLink.join(", ") + ")" : ""}`);
console.log(`Status != publicado: ${naoPublicado.length}`);
console.log(`Slugs duplicados: ${duplicadoSlug.length}`);

const estimadoRender = totalCSV
  - semTitulo.length
  - semLink.length
  - naoPublicado.length
  - duplicadoSlug.length;

console.log(`≈ Itens que o app exibiria: ${estimadoRender}`);
