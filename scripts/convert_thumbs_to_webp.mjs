import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const thumbsDir = path.resolve('public', 'thumbs');
const backupDir = path.join(thumbsDir, 'png-backup');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function listPngFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => name.toLowerCase().endsWith('.png'));
}

async function convertOne(pngFile) {
  const baseName = pngFile.replace(/\.png$/i, '');
  const srcPath = path.join(thumbsDir, pngFile);
  const webpPath = path.join(thumbsDir, `${baseName}.webp`);
  const dstPngPath = path.join(backupDir, pngFile);

  try {
    // Skip if WebP already exists and backup PNG exists
    const existing = await Promise.allSettled([
      fs.stat(webpPath),
      fs.stat(dstPngPath),
    ]);
    const webpExists = existing[0].status === 'fulfilled';
    const backupExists = existing[1].status === 'fulfilled';

    if (!webpExists) {
      await sharp(srcPath)
        .webp({ quality: 82, effort: 6 })
        .toFile(webpPath);
    }

    // Ensure backup dir then move original PNG
    if (!backupExists) {
      await ensureDir(backupDir);
      await fs.rename(srcPath, dstPngPath);
    } else {
      // If backup exists but source still present, remove source to avoid duplicates
      await fs.rm(srcPath, { force: true });
    }

    return { file: pngFile, status: 'ok' };
  } catch (error) {
    return { file: pngFile, status: 'error', error };
  }
}

async function run() {
  console.log('🔄 Convertendo PNG para WebP e movendo PNGs para thumbs/png-backup ...');
  await ensureDir(backupDir);
  const pngFiles = await listPngFiles(thumbsDir);
  if (pngFiles.length === 0) {
    console.log('Nenhum PNG encontrado em public/thumbs');
    return;
  }

  const results = await Promise.all(pngFiles.map(convertOne));
  const ok = results.filter((r) => r.status === 'ok').length;
  const err = results.length - ok;
  console.log(`✅ Convertidos: ${ok} | ❌ Erros: ${err}`);
  if (err > 0) {
    for (const r of results.filter((x) => x.status === 'error')) {
      console.error(`  - ${r.file}:`, r.error?.message || r.error);
    }
  }
}

run().catch((e) => {
  console.error('Erro geral na conversão:', e);
  process.exit(1);
});


