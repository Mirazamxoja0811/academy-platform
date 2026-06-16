# Django Migration Fix & Directory Setup Script
# This script will clean up old migrations and create required directories

$AcademyDir = "c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"
Set-Location $AcademyDir

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       DJANGO MIGRATION FIX & DIRECTORY SETUP" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Working in: $(Get-Location)"
Write-Host ""

# Task 1: Delete db.sqlite3
Write-Host "Task 1: Delete db.sqlite3"
if (Test-Path "db.sqlite3") {
    Remove-Item "db.sqlite3" -Force
    Write-Host "  [OK] Deleted db.sqlite3" -ForegroundColor Green
} else {
    Write-Host "  [OK] db.sqlite3 doesn't exist" -ForegroundColor Green
}

# Task 2: Create static directory
Write-Host ""
Write-Host "Task 2: Create 'static' directory"
if (Test-Path "static") {
    Write-Host "  [OK] 'static' directory already exists" -ForegroundColor Green
} else {
    New-Item -ItemType Directory -Path "static" | Out-Null
    Write-Host "  [OK] Created 'static' directory" -ForegroundColor Green
}

# Task 3: Create media directory
Write-Host ""
Write-Host "Task 3: Create 'media' directory"
if (Test-Path "media") {
    Write-Host "  [OK] 'media' directory already exists" -ForegroundColor Green
} else {
    New-Item -ItemType Directory -Path "media" | Out-Null
    Write-Host "  [OK] Created 'media' directory" -ForegroundColor Green
}

# Task 4: Create media\avatars subdirectory
Write-Host ""
Write-Host "Task 4: Create 'media\avatars' subdirectory"
if (Test-Path "media\avatars") {
    Write-Host "  [OK] 'media\avatars' directory already exists" -ForegroundColor Green
} else {
    New-Item -ItemType Directory -Path "media\avatars" -Force | Out-Null
    Write-Host "  [OK] Created 'media\avatars' directory" -ForegroundColor Green
}

# Task 5: Clean up main\migrations folder (delete .py files except __init__.py)
Write-Host ""
Write-Host "Task 5: Clean up 'main\migrations' folder"
if (Test-Path "main\migrations") {
    $PyFiles = Get-ChildItem "main\migrations" -Filter "*.py" | Where-Object { $_.Name -ne "__init__.py" }
    if ($PyFiles) {
        Write-Host "  Found migration files to delete:" -ForegroundColor Yellow
        foreach ($file in $PyFiles) {
            Remove-Item $file.FullName -Force
            Write-Host "    [OK] Deleted: $($file.Name)" -ForegroundColor Green
        }
    } else {
        Write-Host "  [OK] No migration files to delete" -ForegroundColor Green
    }
} else {
    Write-Host "  [ERR] 'main\migrations' folder doesn't exist" -ForegroundColor Red
}

# Verification
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "          VERIFICATION - Final State" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "db.sqlite3") {
    Write-Host "[ERR] db.sqlite3 still exists" -ForegroundColor Red
} else {
    Write-Host "[OK] db.sqlite3 deleted" -ForegroundColor Green
}

if (Test-Path "static") {
    Write-Host "[OK] static directory exists" -ForegroundColor Green
} else {
    Write-Host "[ERR] static directory missing" -ForegroundColor Red
}

if (Test-Path "media") {
    Write-Host "[OK] media directory exists" -ForegroundColor Green
} else {
    Write-Host "[ERR] media directory missing" -ForegroundColor Red
}

if (Test-Path "media\avatars") {
    Write-Host "[OK] media\avatars directory exists" -ForegroundColor Green
} else {
    Write-Host "[ERR] media\avatars directory missing" -ForegroundColor Red
}

if (Test-Path "main\migrations\__init__.py") {
    Write-Host "[OK] __init__.py preserved in migrations" -ForegroundColor Green
} else {
    Write-Host "[WAR] __init__.py not found in migrations" -ForegroundColor Yellow
}

# Show directory structure
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "          DIRECTORY STRUCTURE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Academy directory contents:"
Get-ChildItem -Name | Sort-Object | ForEach-Object {
    if ((Get-Item $_).PSIsContainer) {
        Write-Host "  [DIR] $_" -ForegroundColor Blue
    } else {
        Write-Host "  [FILE] $_"
    }
}

if (Test-Path "main\migrations") {
    Write-Host ""
    Write-Host "main\migrations directory contents:"
    Get-ChildItem "main\migrations" -Name | Sort-Object | ForEach-Object {
        if ((Get-Item "main\migrations\$_").PSIsContainer) {
            Write-Host "    [DIR] $_" -ForegroundColor Blue
        } else {
            Write-Host "    [FILE] $_"
        }
    }
}

if (Test-Path "media") {
    Write-Host ""
    Write-Host "media directory contents:"
    Get-ChildItem "media" -Recurse -Name | Sort-Object | ForEach-Object {
        if ((Get-Item "media\$_" -ErrorAction SilentlyContinue).PSIsContainer) {
            Write-Host "    [DIR] $_" -ForegroundColor Blue
        } else {
            Write-Host "    [FILE] $_"
        }
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "       [SUCCESS] ALL TASKS COMPLETED!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
