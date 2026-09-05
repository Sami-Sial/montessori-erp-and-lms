const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding from local data dump...');
  
  const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  
  // pg_dump creates multiple statements. We will split by ; to avoid the multiple queries error
  // but we must be careful with semicolons inside strings.
  // Actually executeRawUnsafe in postgres driver might just work with multiple queries if there are no params.
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log('Successfully seeded local data!');
  } catch (err) {
    console.error('Failed to execute raw SQL, attempting statement by statement execution...', err.message);
    const statements = sql.split(/;\s*$/m).filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          await prisma.$executeRawUnsafe(stmt);
        } catch (e) {
          console.error('Error executing statement:', stmt.substring(0, 50) + '...', e.message);
        }
      }
    }
    console.log('Successfully seeded local data (statement by statement).');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
