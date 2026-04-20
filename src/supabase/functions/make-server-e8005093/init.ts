// Database initialization script
// Run this once to populate initial data
import { seedDatabase } from './seed.ts';

console.log('Initializing Care-PRO database...');

seedDatabase()
  .then(() => {
    console.log('✅ Database initialization complete!');
    Deno.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    Deno.exit(1);
  });
