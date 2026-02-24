import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const repoRoot = process.cwd();
const migrationsDir = join(repoRoot, 'prisma', 'migrations');
const markerPattern = /^(<<<<<<<|=======|>>>>>>>) /m;

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.endsWith('.sql')) {
      files.push(fullPath);
    }
  }

  return files;
}

const sqlFiles = walk(migrationsDir);
const offenders = [];

for (const filePath of sqlFiles) {
  const content = readFileSync(filePath, 'utf8');
  if (markerPattern.test(content)) {
    offenders.push(relative(repoRoot, filePath));
  }
}

if (offenders.length > 0) {
  console.error('Found unresolved merge conflict markers in Prisma migration files:');
  for (const file of offenders) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log('No unresolved merge conflict markers found in prisma/migrations.');
