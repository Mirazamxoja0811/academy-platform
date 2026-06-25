path = '../frontend/src/app/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('Instagram, Youtube, Facebook, Send', 'Send')
content = content.replace('<Instagram className="w-5 h-5"/>', 'Ig')
content = content.replace('<Youtube className="w-5 h-5"/>', 'Yt')
content = content.replace('<Facebook className="w-5 h-5"/>', 'Fb')
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
