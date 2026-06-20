with open('main/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

imports_to_add = "import os\nfrom django.conf import settings\n"
if "import os" not in content:
    content = imports_to_add + content
    
with open('main/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Imports added")
