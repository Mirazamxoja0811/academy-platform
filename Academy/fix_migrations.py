#!/usr/bin/env python3
"""
Django Migration Fixer - Removes old migrations and creates required directories
"""

import os
import sys
from pathlib import Path

def main():
    # Set the Academy directory
    academy_dir = Path(r"c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy")
    os.chdir(academy_dir)
    
    print("=" * 60)
    print("DJANGO MIGRATION FIX & DIRECTORY SETUP")
    print("=" * 60)
    print(f"\nWorking in: {os.getcwd()}\n")
    
    # Task 1: Delete db.sqlite3
    print("Task 1: Delete db.sqlite3")
    db_file = academy_dir / "db.sqlite3"
    if db_file.exists():
        db_file.unlink()
        print("  ✓ Deleted db.sqlite3")
    else:
        print("  ✓ db.sqlite3 doesn't exist (nothing to delete)")
    
    # Task 2: Create static directory
    print("\nTask 2: Create 'static' directory")
    static_dir = academy_dir / "static"
    if static_dir.exists():
        print("  ✓ 'static' directory already exists")
    else:
        static_dir.mkdir()
        print("  ✓ Created 'static' directory")
    
    # Task 3: Create media directory
    print("\nTask 3: Create 'media' directory")
    media_dir = academy_dir / "media"
    if media_dir.exists():
        print("  ✓ 'media' directory already exists")
    else:
        media_dir.mkdir()
        print("  ✓ Created 'media' directory")
    
    # Task 4: Create media\avatars subdirectory
    print("\nTask 4: Create 'media\\avatars' subdirectory")
    avatars_dir = academy_dir / "media" / "avatars"
    if avatars_dir.exists():
        print("  ✓ 'media\\avatars' directory already exists")
    else:
        avatars_dir.mkdir(parents=True, exist_ok=True)
        print("  ✓ Created 'media\\avatars' directory")
    
    # Task 5: Clean up main\migrations folder (delete .py files except __init__.py)
    print("\nTask 5: Clean up 'main\\migrations' folder")
    migrations_dir = academy_dir / "main" / "migrations"
    if migrations_dir.exists():
        py_files = [f for f in migrations_dir.glob("*.py") if f.name != "__init__.py"]
        if py_files:
            print("  Found migration files to delete:")
            for py_file in py_files:
                py_file.unlink()
                print(f"    ✓ Deleted: {py_file.name}")
        else:
            print("  ✓ No migration files to delete (only __init__.py or folder is empty)")
    else:
        print("  ✗ 'main\\migrations' folder doesn't exist")
    
    # Verification
    print("\n" + "=" * 60)
    print("VERIFICATION - Final State")
    print("=" * 60)
    
    print(f"\n✓ db.sqlite3 deleted: {not db_file.exists()}")
    print(f"✓ static directory exists: {static_dir.exists()}")
    print(f"✓ media directory exists: {media_dir.exists()}")
    print(f"✓ media\\avatars exists: {avatars_dir.exists()}")
    
    if migrations_dir.exists():
        remaining_py = list(migrations_dir.glob("*.py"))
        print(f"✓ Migration .py files (remaining): {len(remaining_py)}")
        for f in remaining_py:
            print(f"    - {f.name}")
    
    print("\n" + "=" * 60)
    print("DIRECTORY STRUCTURE")
    print("=" * 60)
    
    print("\nAcademy directory contents:")
    for item in sorted(academy_dir.iterdir()):
        if item.is_dir():
            print(f"  [DIR] {item.name}")
        else:
            print(f"  [FILE] {item.name}")
    
    if migrations_dir.exists():
        print(f"\nmain\\migrations directory contents:")
        for item in sorted(migrations_dir.iterdir()):
            if item.is_dir():
                print(f"    [DIR] {item.name}")
            else:
                print(f"    [FILE] {item.name}")
    
    if media_dir.exists():
        print(f"\nmedia directory contents:")
        for item in sorted(media_dir.iterdir()):
            if item.is_dir():
                print(f"    [DIR] {item.name}")
            else:
                print(f"    [FILE] {item.name}")
    
    print("\n" + "=" * 60)
    print("✓ ALL TASKS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n✗ ERROR: {e}", file=sys.stderr)
        sys.exit(1)
