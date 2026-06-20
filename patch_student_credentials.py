import glob
import re
import os

files = glob.glob('frontend/src/app/student/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    content = re.sub(r'fetch\(([`\'"][^`\'"]+[`\'"])\)', r'fetch(\1, { credentials: "include" })', content)
    content = re.sub(r'fetch\(([`\'"][^`\'"]+[`\'"]),\s*\{', r'fetch(\1, { credentials: "include", ', content)
    content = content.replace('{ credentials: "include",  credentials: "include", ', '{ credentials: "include", ')
    content = content.replace('{ credentials: "include", credentials: "include", ', '{ credentials: "include", ')

    content = re.sub(r'axios\.get\(([`\'"][^`\'"]+[`\'"])\)', r'axios.get(\1, { withCredentials: true })', content)
    content = re.sub(r'axios\.post\(([`\'"][^`\'"]+[`\'"]),\s*([^)]+)\)', r'axios.post(\1, \2, { withCredentials: true })', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated student credentials")
