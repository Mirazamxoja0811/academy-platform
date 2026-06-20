# Django Migration Fix - Task Summary

## Overview
This document describes the tasks to fix Django migration conflicts and create required directories for the Academy project.

## Tasks to Complete

### 1. Delete db.sqlite3
- **Purpose**: Remove old database with conflicting migration history
- **File**: `db.sqlite3` in the project root
- **Action**: Delete if exists
- **Status**: Will be checked and deleted

### 2. Create 'static' Directory
- **Purpose**: Store static files (CSS, JS, images)
- **Path**: `Academy/static/`
- **Action**: Create if doesn't exist
- **Status**: Will be created or verified

### 3. Create 'media' Directory
- **Purpose**: Store uploaded user media files
- **Path**: `Academy/media/`
- **Action**: Create if doesn't exist
- **Status**: Will be created or verified

### 4. Create 'media/avatars' Subdirectory
- **Purpose**: Store user avatar images
- **Path**: `Academy/media/avatars/`
- **Action**: Create if doesn't exist
- **Status**: Will be created or verified

### 5. Clean 'main/migrations' Folder
- **Purpose**: Remove conflicting migration files (keep only __init__.py)
- **Location**: `Academy/main/migrations/`
- **Files to delete**: All `.py` files EXCEPT `__init__.py`
- **Current files**: 
  - `0001_initial.py` (WILL BE DELETED)
  - `__init__.py` (WILL BE PRESERVED)
  - `__pycache__/` (not touched)

## Available Scripts

Three scripts have been created to perform these tasks:

### Option 1: Python Script (Recommended)
```
File: fix_migrations.py
Command: python fix_migrations.py
Python 3.6+ required
```

### Option 2: Batch File (Windows Command Prompt)
```
File: fix_migrations.bat
Command: fix_migrations.bat
Works with: cmd.exe
```

### Option 3: PowerShell Script
```
File: fix_migrations.ps1
Command: powershell -ExecutionPolicy Bypass -File fix_migrations.ps1
Works with: PowerShell 5.0+
```

## How to Run

### Using Python (Most Reliable):
```bash
cd "c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"
python fix_migrations.py
```

### Using Batch File:
```bash
cd "c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"
fix_migrations.bat
```

### Using PowerShell:
```powershell
cd "c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"
powershell -ExecutionPolicy Bypass -File fix_migrations.ps1
```

## What Gets Done

✓ db.sqlite3 deleted (fresh database for new migrations)
✓ static/ directory created (for CSS, JS, images)
✓ media/ directory created (for user uploads)
✓ media/avatars/ subdirectory created (for user avatars)
✓ Migration files cleaned (old migrations removed)
✓ __init__.py preserved (Django package marker)

## Manual Commands (If Scripts Don't Work)

If scripts don't work, you can run these commands manually:

### In Command Prompt:
```batch
cd /d "c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"
del db.sqlite3
mkdir static
mkdir media
mkdir media\avatars
del main\migrations\0001_initial.py
```

### In PowerShell:
```powershell
cd "c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"
Remove-Item db.sqlite3 -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path static -Force | Out-Null
New-Item -ItemType Directory -Path media -Force | Out-Null
New-Item -ItemType Directory -Path media\avatars -Force | Out-Null
Remove-Item main\migrations\0001_initial.py -Force -ErrorAction SilentlyContinue
```

## After Running Scripts

After the scripts complete, you'll need to:

1. **Create new migrations** (to replace deleted old ones):
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Collect static files** (for production):
   ```bash
   python manage.py collectstatic
   ```

3. **Update Django settings** (if not already done):
   - STATIC_URL = '/static/'
   - STATIC_ROOT = os.path.join(BASE_DIR, 'static')
   - MEDIA_URL = '/media/'
   - MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

## Directory Structure After Completion

```
Academy/
├── db.sqlite3          [DELETED]
├── manage.py
├── static/             [CREATED]
├── media/              [CREATED]
│   └── avatars/        [CREATED]
├── main/
│   ├── migrations/
│   │   ├── __init__.py [KEPT]
│   │   ├── 0001_initial.py [DELETED]
│   │   └── __pycache__/
│   └── ...
└── templates/
```

## Troubleshooting

### Issue: Script Won't Run
- **Solution 1**: Use Python script (most compatible)
- **Solution 2**: Run commands manually from Command Prompt
- **Solution 3**: Check execution policies (PowerShell)

### Issue: Permission Denied
- **Solution**: Run Command Prompt or PowerShell as Administrator

### Issue: Directory Already Exists
- **Solution**: Scripts will detect and skip creation (safe to re-run)

## Contact / Support

If any task fails:
1. Check the error message
2. Verify the path is correct
3. Try running as Administrator
4. Run manual commands if scripts fail
