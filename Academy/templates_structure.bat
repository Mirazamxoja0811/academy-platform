@echo off
REM Create the templates directory structure
cd /d "c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"

echo Creating directory structure...

mkdir templates
mkdir templates\auth
mkdir templates\student
mkdir templates\teacher
mkdir templates\admin_dashboard
mkdir templates\components
mkdir templates\includes

echo.
echo Directory structure created successfully!
echo.
echo Structure created:
echo.
tree templates /F

pause
