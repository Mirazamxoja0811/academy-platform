@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   STARTING FILE SYSTEM OPERATIONS
echo ========================================
echo.

REM Navigate to target directory
cd /d "c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"

echo Current directory: %cd%
echo.

REM 1. Delete db.sqlite3 if it exists
echo [1] Deleting db.sqlite3 if it exists...
if exist "db.sqlite3" (
    del /F /Q "db.sqlite3"
    if !errorlevel! equ 0 (
        echo     ✓ db.sqlite3 deleted successfully
    ) else (
        echo     ✗ Failed to delete db.sqlite3
    )
) else (
    echo     - db.sqlite3 does not exist
)
echo.

REM 2. Create "static" directory if it doesn't exist
echo [2] Creating "static" directory if it doesn't exist...
if exist "static" (
    echo     - "static" directory already exists
) else (
    mkdir "static"
    if !errorlevel! equ 0 (
        echo     ✓ "static" directory created successfully
    ) else (
        echo     ✗ Failed to create "static" directory
    )
)
echo.

REM 3. Create "media" directory if it doesn't exist
echo [3] Creating "media" directory if it doesn't exist...
if exist "media" (
    echo     - "media" directory already exists
) else (
    mkdir "media"
    if !errorlevel! equ 0 (
        echo     ✓ "media" directory created successfully
    ) else (
        echo     ✗ Failed to create "media" directory
    )
)
echo.

REM 4. Create "media\avatars" subdirectory if it doesn't exist
echo [4] Creating "media\avatars" subdirectory if it doesn't exist...
if exist "media\avatars" (
    echo     - "media\avatars" subdirectory already exists
) else (
    mkdir "media\avatars"
    if !errorlevel! equ 0 (
        echo     ✓ "media\avatars" subdirectory created successfully
    ) else (
        echo     ✗ Failed to create "media\avatars" subdirectory
    )
)
echo.

REM 5. Delete "0001_initial.py" from "main\migrations" folder
echo [5] Deleting "0001_initial.py" from "main\migrations" folder...
if exist "main\migrations\0001_initial.py" (
    del /F /Q "main\migrations\0001_initial.py"
    if !errorlevel! equ 0 (
        echo     ✓ "0001_initial.py" deleted successfully
    ) else (
        echo     ✗ Failed to delete "0001_initial.py"
    )
) else (
    echo     - "0001_initial.py" does not exist
)
echo.

echo ========================================
echo   VERIFYING FINAL STATE
echo ========================================
echo.

echo Checking db.sqlite3:
if exist "db.sqlite3" (
    echo   ✗ db.sqlite3 still exists
) else (
    echo   ✓ db.sqlite3 has been deleted
)
echo.

echo Checking directories in Academy:
if exist "static" (
    echo   ✓ static directory exists
) else (
    echo   ✗ static directory NOT found
)

if exist "media" (
    echo   ✓ media directory exists
) else (
    echo   ✗ media directory NOT found
)

if exist "media\avatars" (
    echo   ✓ media\avatars subdirectory exists
) else (
    echo   ✗ media\avatars subdirectory NOT found
)
echo.

echo Checking main\migrations folder:
if exist "main\migrations\0001_initial.py" (
    echo   ✗ 0001_initial.py still exists
) else (
    echo   ✓ 0001_initial.py has been deleted
)

if exist "main\migrations\__init__.py" (
    echo   ✓ __init__.py still exists
) else (
    echo   ✗ __init__.py NOT found
)
echo.

echo Listing current directory structure:
echo.
echo Academy directory contents:
dir /B
echo.

echo main\migrations directory contents:
dir /B "main\migrations"
echo.

echo ========================================
echo   OPERATIONS COMPLETED
echo ========================================
