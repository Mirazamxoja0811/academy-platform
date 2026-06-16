#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const targetDir = 'c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy';
process.chdir(targetDir);

console.log('='.repeat(50));
console.log('  STARTING FILE SYSTEM OPERATIONS');
console.log('='.repeat(50));
console.log();
console.log(`Current directory: ${process.cwd()}`);
console.log();

// Operation 1: Delete db.sqlite3
console.log('[1] Deleting db.sqlite3 if it exists...');
try {
  if (fs.existsSync('db.sqlite3')) {
    fs.unlinkSync('db.sqlite3');
    console.log('    ✓ db.sqlite3 deleted successfully');
  } else {
    console.log('    - db.sqlite3 does not exist');
  }
} catch (e) {
  console.log(`    ✗ Failed to delete db.sqlite3: ${e.message}`);
}
console.log();

// Operation 2: Create static directory
console.log('[2] Creating "static" directory if it doesn\'t exist...');
try {
  if (!fs.existsSync('static')) {
    fs.mkdirSync('static', { recursive: true });
    console.log('    ✓ "static" directory created successfully');
  } else {
    console.log('    - "static" directory already exists');
  }
} catch (e) {
  console.log(`    ✗ Failed to create "static" directory: ${e.message}`);
}
console.log();

// Operation 3: Create media directory
console.log('[3] Creating "media" directory if it doesn\'t exist...');
try {
  if (!fs.existsSync('media')) {
    fs.mkdirSync('media', { recursive: true });
    console.log('    ✓ "media" directory created successfully');
  } else {
    console.log('    - "media" directory already exists');
  }
} catch (e) {
  console.log(`    ✗ Failed to create "media" directory: ${e.message}`);
}
console.log();

// Operation 4: Create media/avatars directory
console.log('[4] Creating "media/avatars" subdirectory if it doesn\'t exist...');
try {
  if (!fs.existsSync('media\\avatars')) {
    fs.mkdirSync('media\\avatars', { recursive: true });
    console.log('    ✓ "media/avatars" subdirectory created successfully');
  } else {
    console.log('    - "media/avatars" subdirectory already exists');
  }
} catch (e) {
  console.log(`    ✗ Failed to create "media/avatars" subdirectory: ${e.message}`);
}
console.log();

// Operation 5: Delete 0001_initial.py
console.log('[5] Deleting "0001_initial.py" from "main/migrations" folder...');
try {
  const migrationFile = path.join('main', 'migrations', '0001_initial.py');
  if (fs.existsSync(migrationFile)) {
    fs.unlinkSync(migrationFile);
    console.log('    ✓ "0001_initial.py" deleted successfully');
  } else {
    console.log('    - "0001_initial.py" does not exist');
  }
} catch (e) {
  console.log(`    ✗ Failed to delete "0001_initial.py": ${e.message}`);
}
console.log();

console.log('='.repeat(50));
console.log('  VERIFYING FINAL STATE');
console.log('='.repeat(50));
console.log();

// Verify db.sqlite3
console.log('Checking db.sqlite3:');
if (fs.existsSync('db.sqlite3')) {
  console.log('   ✗ db.sqlite3 still exists');
} else {
  console.log('   ✓ db.sqlite3 has been deleted');
}
console.log();

// Verify directories
console.log('Checking directories in Academy:');
if (fs.existsSync('static')) {
  console.log('   ✓ static directory exists');
} else {
  console.log('   ✗ static directory NOT found');
}

if (fs.existsSync('media')) {
  console.log('   ✓ media directory exists');
} else {
  console.log('   ✗ media directory NOT found');
}

if (fs.existsSync(path.join('media', 'avatars'))) {
  console.log('   ✓ media/avatars subdirectory exists');
} else {
  console.log('   ✗ media/avatars subdirectory NOT found');
}
console.log();

// Verify migrations
console.log('Checking main/migrations folder:');
const migrationFile = path.join('main', 'migrations', '0001_initial.py');
const initFile = path.join('main', 'migrations', '__init__.py');

if (fs.existsSync(migrationFile)) {
  console.log('   ✗ 0001_initial.py still exists');
} else {
  console.log('   ✓ 0001_initial.py has been deleted');
}

if (fs.existsSync(initFile)) {
  console.log('   ✓ __init__.py still exists (preserved)');
} else {
  console.log('   ✗ __init__.py NOT found');
}
console.log();

// List directory structure
console.log('='.repeat(50));
console.log('  DIRECTORY STRUCTURE');
console.log('='.repeat(50));
console.log();

console.log('Academy directory contents:');
try {
  const items = fs.readdirSync('.').sort();
  items.forEach(item => {
    const itemPath = path.join('.', item);
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      console.log(`  [DIR]  ${item}`);
    } else {
      console.log(`  [FILE] ${item}`);
    }
  });
} catch (e) {
  console.log(`Error listing directory: ${e.message}`);
}
console.log();

console.log('main/migrations directory contents:');
try {
  const items = fs.readdirSync(path.join('main', 'migrations')).sort();
  items.forEach(item => {
    const itemPath = path.join('main', 'migrations', item);
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      console.log(`  [DIR]  ${item}`);
    } else {
      console.log(`  [FILE] ${item}`);
    }
  });
} catch (e) {
  console.log(`Error listing directory: ${e.message}`);
}
console.log();

console.log('media directory contents:');
try {
  const items = fs.readdirSync('media').sort();
  items.forEach(item => {
    const itemPath = path.join('media', item);
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      console.log(`  [DIR]  ${item}`);
    } else {
      console.log(`  [FILE] ${item}`);
    }
  });
} catch (e) {
  console.log(`Error listing directory: ${e.message}`);
}
console.log();

console.log('='.repeat(50));
console.log('  OPERATIONS COMPLETED');
console.log('='.repeat(50));
