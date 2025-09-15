#!/usr/bin/env node

import { 
  setOfficerPasswordById, 
  setOfficerPasswordByEmail, 
  listOfficersPasswordStatus,
  bulkSetPasswords,
  setRandomPasswordForOfficer
} from '../src/utils/officerPasswordManager.js';

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  try {
    switch (command) {
      case 'list':
        await listOfficersPasswordStatus();
        break;
        
      case 'set-by-id':
        if (args.length < 2) {
          console.error('Usage: node manage-officer-passwords.js set-by-id <officerId> <password>');
          process.exit(1);
        }
        await setOfficerPasswordById(parseInt(args[0]), args[1]);
        break;
        
      case 'set-by-email':
        if (args.length < 2) {
          console.error('Usage: node manage-officer-passwords.js set-by-email <email> <password>');
          process.exit(1);
        }
        await setOfficerPasswordByEmail(args[0], args[1]);
        break;
        
      case 'set-random':
        if (args.length < 1) {
          console.error('Usage: node manage-officer-passwords.js set-random <officerId> [length]');
          process.exit(1);
        }
        const length = args[1] ? parseInt(args[1]) : 8;
        const result = await setRandomPasswordForOfficer(parseInt(args[0]), length);
        console.log(`\n🔑 Generated password for officer ${result.officerId}: ${result.password}`);
        console.log('⚠️  Please share this password securely with the officer.');
        break;
        
      case 'bulk-set':
        if (args.length < 1) {
          console.error('Usage: node manage-officer-passwords.js bulk-set <jsonFile>');
          console.error('JSON file format: [{"officerId": 1, "password": "password1"}, ...]');
          process.exit(1);
        }
        const fs = await import('fs/promises');
        const data = await fs.readFile(args[0], 'utf8');
        const officerPasswords = JSON.parse(data);
        await bulkSetPasswords(officerPasswords);
        break;
        
      default:
        console.log('Officer Password Management Tool');
        console.log('================================');
        console.log('');
        console.log('Available commands:');
        console.log('  list                    - List all officers and their password status');
        console.log('  set-by-id <id> <pass>   - Set password for officer by ID');
        console.log('  set-by-email <email> <pass> - Set password for officer by email');
        console.log('  set-random <id> [len]   - Set random password for officer');
        console.log('  bulk-set <jsonFile>     - Set passwords for multiple officers');
        console.log('');
        console.log('Examples:');
        console.log('  node manage-officer-passwords.js list');
        console.log('  node manage-officer-passwords.js set-by-id 1 "password123"');
        console.log('  node manage-officer-passwords.js set-by-email "officer@example.com" "password123"');
        console.log('  node manage-officer-passwords.js set-random 1 12');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
