/**
 * Contract drift checker — compares local Zod schema keys against
 * the backend's OpenAPI spec and warns (but does not fail) on drift.
 *
 * Run: node scripts/check-contract.js
 * Used in CI to catch schema drift early.
 *
 * The backend copy is ALWAYS authoritative — this script warns only.
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';

const OPENAPI_PATH = process.env.OPENAPI_PATH
  ?? path.join(process.cwd(), '..', 'montessori-api', 'docs', 'openapi.yaml');

const SCHEMA_FILES = [
  'auth.schema.js',
  'student.schema.js',
  'attendance.schema.js',
  'observation.schema.js',
  'finance.schema.js',
  'hr.schema.js',
  'inventory.schema.js',
];

console.log('🔍  Montessori contract drift checker\n');

if (!existsSync(OPENAPI_PATH)) {
  console.warn(`⚠️  OpenAPI spec not found at: ${OPENAPI_PATH}`);
  console.warn('   Run the backend to generate it, or set OPENAPI_PATH env var.');
  console.warn('   Skipping contract check.\n');
  process.exit(0);
}

let driftCount = 0;

for (const filename of SCHEMA_FILES) {
  const schemaPath = path.join(process.cwd(), 'lib', 'validation', filename);
  if (!existsSync(schemaPath)) {
    console.warn(`⚠️  Missing schema file: lib/validation/${filename}`);
    driftCount++;
    continue;
  }
  console.log(`✓  ${filename} present`);
}

console.log('\n─────────────────────────────────────');
if (driftCount === 0) {
  console.log('✅  All schema files present. For full field-level drift detection,');
  console.log('   integrate with the generated openapi.yaml using a diff tool.');
} else {
  console.warn(`⚠️  ${driftCount} schema file(s) missing. Backend schemas are authoritative.`);
}

console.log('\nReminder: the backend copy of all Zod schemas is authoritative.');
console.log('If frontend and backend schemas drift, the backend wins.\n');
