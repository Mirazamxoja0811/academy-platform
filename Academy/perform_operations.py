#!/usr/bin/env python3
"""
File system operations script
"""
import os
import shutil
from pathlib import Path

# Set target directory
target_dir = r"c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"
os.chdir(target_dir)

print("=" * 50)
print("  STARTING FILE SYSTEM OPERATIONS")
print("=" * 50)
print()
print(f"Current directory: {os.getcwd()}")
print()

# Operation 1: Delete db.sqlite3 if it exists
print("[1] Deleting db.sqlite3 if it exists...")
db_file = "db.sqlite3"
if os.path.exists(db_file):
    try:
        os.remove(db_file)
        print("    ✓ db.sqlite3 deleted successfully")
    except Exception as e:
        print(f"    ✗ Failed to delete db.sqlite3: {e}")
else:
    print("    - db.sqlite3 does not exist")
print()

# Operation 2: Create "static" directory if it doesn't exist
print("[2] Creating 'static' directory if it doesn't exist...")
static_dir = "static"
if os.path.exists(static_dir):
    print("    - 'static' directory already exists")
else:
    try:
        os.makedirs(static_dir, exist_ok=True)
        print("    ✓ 'static' directory created successfully")
    except Exception as e:
        print(f"    ✗ Failed to create 'static' directory: {e}")
print()

# Operation 3: Create "media" directory if it doesn't exist
print("[3] Creating 'media' directory if it doesn't exist...")
media_dir = "media"
if os.path.exists(media_dir):
    print("    - 'media' directory already exists")
else:
    try:
        os.makedirs(media_dir, exist_ok=True)
        print("    ✓ 'media' directory created successfully")
    except Exception as e:
        print(f"    ✗ Failed to create 'media' directory: {e}")
print()

# Operation 4: Create "media\avatars" subdirectory if it doesn't exist
print("[4] Creating 'media/avatars' subdirectory if it doesn't exist...")
avatars_dir = os.path.join("media", "avatars")
if os.path.exists(avatars_dir):
    print("    - 'media/avatars' subdirectory already exists")
else:
    try:
        os.makedirs(avatars_dir, exist_ok=True)
        print("    ✓ 'media/avatars' subdirectory created successfully")
    except Exception as e:
        print(f"    ✗ Failed to create 'media/avatars' subdirectory: {e}")
print()

# Operation 5: Delete "0001_initial.py" from "main\migrations" folder
print("[5] Deleting '0001_initial.py' from 'main/migrations' folder...")
migration_file = os.path.join("main", "migrations", "0001_initial.py")
if os.path.exists(migration_file):
    try:
        os.remove(migration_file)
        print("    ✓ '0001_initial.py' deleted successfully")
    except Exception as e:
        print(f"    ✗ Failed to delete '0001_initial.py': {e}")
else:
    print("    - '0001_initial.py' does not exist")
print()

print("=" * 50)
print("  VERIFYING FINAL STATE")
print("=" * 50)
print()

# Verify db.sqlite3
print("Checking db.sqlite3:")
if os.path.exists("db.sqlite3"):
    print("   ✗ db.sqlite3 still exists")
else:
    print("   ✓ db.sqlite3 has been deleted")
print()

# Verify directories
print("Checking directories in Academy:")
if os.path.exists("static"):
    print("   ✓ static directory exists")
else:
    print("   ✗ static directory NOT found")

if os.path.exists("media"):
    print("   ✓ media directory exists")
else:
    print("   ✗ media directory NOT found")

if os.path.exists(os.path.join("media", "avatars")):
    print("   ✓ media/avatars subdirectory exists")
else:
    print("   ✗ media/avatars subdirectory NOT found")
print()

# Verify migrations
print("Checking main/migrations folder:")
if os.path.exists(os.path.join("main", "migrations", "0001_initial.py")):
    print("   ✗ 0001_initial.py still exists")
else:
    print("   ✓ 0001_initial.py has been deleted")

if os.path.exists(os.path.join("main", "migrations", "__init__.py")):
    print("   ✓ __init__.py still exists (preserved)")
else:
    print("   ✗ __init__.py NOT found")
print()

# List directory structure
print("=" * 50)
print("  DIRECTORY STRUCTURE")
print("=" * 50)
print()

print("Academy directory contents:")
try:
    items = sorted(os.listdir("."))
    for item in items:
        item_path = os.path.join(".", item)
        if os.path.isdir(item_path):
            print(f"  [DIR]  {item}")
        else:
            print(f"  [FILE] {item}")
except Exception as e:
    print(f"Error listing directory: {e}")
print()

print("main/migrations directory contents:")
try:
    migration_items = sorted(os.listdir(os.path.join("main", "migrations")))
    for item in migration_items:
        item_path = os.path.join("main", "migrations", item)
        if os.path.isdir(item_path):
            print(f"  [DIR]  {item}")
        else:
            print(f"  [FILE] {item}")
except Exception as e:
    print(f"Error listing directory: {e}")
print()

print("media directory contents:")
try:
    media_items = sorted(os.listdir("media"))
    for item in media_items:
        item_path = os.path.join("media", item)
        if os.path.isdir(item_path):
            print(f"  [DIR]  {item}")
        else:
            print(f"  [FILE] {item}")
except Exception as e:
    print(f"Error listing directory: {e}")
print()

print("=" * 50)
print("  OPERATIONS COMPLETED")
print("=" * 50)
