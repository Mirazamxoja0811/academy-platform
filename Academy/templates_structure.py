#!/usr/bin/env python3
"""
Create the templates directory structure for the Academy project.
"""

import os
from pathlib import Path

def create_directory_structure():
    """Create all necessary template directories."""
    
    # Define the base path
    base_path = r"c:\Users\miraz\OneDrive\Desktop\SWT programming\Academy"
    
    # Define the directories to create
    directories = [
        "templates",
        "templates/auth",
        "templates/student",
        "templates/teacher",
        "templates/admin_dashboard",
        "templates/components",
        "templates/includes"
    ]
    
    print("Creating directory structure...")
    print("=" * 70)
    
    # Create each directory
    for dir_path in directories:
        full_path = os.path.join(base_path, dir_path)
        Path(full_path).mkdir(parents=True, exist_ok=True)
        print(f"✓ Created: {full_path}")
    
    # Display the created structure
    print("\n" + "=" * 70)
    print("Final Directory Structure:")
    print("=" * 70)
    
    templates_path = os.path.join(base_path, "templates")
    for root, dirs, files in os.walk(templates_path):
        level = root.replace(templates_path, "").count(os.sep)
        indent = "  " * level
        dir_name = os.path.basename(root)
        if level == 0:
            print(f"templates/")
        else:
            print(f"{indent}├── {dir_name}/")
        
        subindent = "  " * (level + 1)
        for file in files:
            print(f"{subindent}├── {file}")
    
    print("\n✓ All directories created successfully!")

if __name__ == "__main__":
    create_directory_structure()
