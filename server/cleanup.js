#!/usr/bin/env node
/**
 * Cleanup Script - Remove Old Consolidated JavaScript Files
 * Run this after verifying the new consolidated files work correctly
 */

const fs = require('fs');
const path = require('path');

const oldFiles = [
  'createVocabFiles.js',
  'createAllVocabs.js',
  'createMissingVocabFiles.js',
  'createFloor3Vocabs.js',
  'checkSchema.js',
  'apply_schema.js',
  'migrate.js',
  'migrateTypeFloor.js',
  'testApi.js',
  'test_models.js'
];

console.log('═══════════════════════════════════════════════════');
console.log('  Cleanup Old Consolidated Files');
console.log('═══════════════════════════════════════════════════\n');

console.log('Files to be deleted:\n');
oldFiles.forEach((file, idx) => {
  console.log(`  ${idx + 1}. ${file}`);
});

console.log('\n\nNew consolidated files to use instead:\n');
console.log('  • vocabGenerator.js   - All vocabulary generation');
console.log('  • schemaManager.js    - Schema application & checking');
console.log('  • migrations.js       - All database migrations');
console.log('  • tests.js            - All testing utilities\n');

console.log('═══════════════════════════════════════════════════\n');

// Check if --force flag is passed
const forceDelete = process.argv.includes('--force');

if (!forceDelete) {
  console.log('To proceed with deletion, run:');
  console.log('  node cleanup.js --force\n');
  process.exit(0);
}

console.log('Deleting old files...\n');

let deletedCount = 0;
let errorCount = 0;

oldFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✓ Deleted: ${file}`);
      deletedCount++;
    } else {
      console.log(`⊘ Not found: ${file}`);
    }
  } catch (err) {
    console.error(`✗ Error deleting ${file}:`, err.message);
    errorCount++;
  }
});

console.log('\n═══════════════════════════════════════════════════');
console.log(`Cleanup complete: ${deletedCount} files deleted, ${errorCount} errors\n`);

if (errorCount === 0) {
  console.log('✓ All old files have been successfully removed!');
  console.log('\nYou can now use the new npm scripts:');
  console.log('  npm run vocab:generate   - Generate all vocabularies');
  console.log('  npm run db:schema-apply  - Apply database schema');
  console.log('  npm run db:migrate       - Run all migrations');
  console.log('  npm test                 - Run all tests\n');
} else {
  console.log('⚠ Some files could not be deleted. Please check manually.\n');
}

console.log('═══════════════════════════════════════════════════\n');
