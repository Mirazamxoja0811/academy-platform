import re

with open('src/app/student/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add messages icon import
content = content.replace(
    'import { LayoutDashboard, CheckSquare, Calendar, Coins, ClipboardList, Settings, LogOut } from "lucide-react";',
    'import { LayoutDashboard, CheckSquare, Calendar, Coins, ClipboardList, Settings, LogOut, MessageSquare } from "lucide-react";'
)

# Add messages menu item
menu_item_old = '{ name: "Sozlamalar", path: "/student/settings", icon: Settings },'
menu_item_new = '{ name: "Xabarlar", path: "/student/messages", icon: MessageSquare },\n    { name: "Sozlamalar", path: "/student/settings", icon: Settings },'

content = content.replace(menu_item_old, menu_item_new)

with open('src/app/student/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated student layout.tsx")
