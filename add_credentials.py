import glob
import re
import os

files = glob.glob('frontend/src/app/teacher/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match fetch('...', { ... }) and insert credentials: 'include' if not present
    # We'll use a simpler approach: 
    # find fetch( URL ) -> fetch( URL, { credentials: "include" })
    # find fetch( URL, { ) -> fetch( URL, { credentials: "include", )
    
    # regex 1: fetch( url ) without options
    content = re.sub(r'fetch\(([`\'"][^`\'"]+[`\'"])\)', r'fetch(\1, { credentials: "include" })', content)
    
    # regex 2: fetch( url, {
    content = re.sub(r'fetch\(([`\'"][^`\'"]+[`\'"]),\s*\{', r'fetch(\1, { credentials: "include", ', content)
    
    # clean up duplicates just in case
    content = content.replace('{ credentials: "include",  credentials: "include", ', '{ credentials: "include", ')
    content = content.replace('{ credentials: "include", credentials: "include", ', '{ credentials: "include", ')

    # if axios is used (some places might use axios):
    # axios.get(url) -> axios.get(url, { withCredentials: true })
    content = re.sub(r'axios\.get\(([`\'"][^`\'"]+[`\'"])\)', r'axios.get(\1, { withCredentials: true })', content)
    content = re.sub(r'axios\.post\(([`\'"][^`\'"]+[`\'"]),\s*([^)]+)\)', r'axios.post(\1, \2, { withCredentials: true })', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated fetch calls with credentials")
