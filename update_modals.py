import os
import re

def update_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "ConfirmModal" not in content:
        # Add import
        content = content.replace('import { useState', 'import ConfirmModal from "@/components/ConfirmModal";\nimport { useState')
        
        # Add state
        state_str = """
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null as any, message: "" });
"""
        content = re.sub(r'(const \[loading, setLoading\] = useState.*?;\n)', r'\1' + state_str, content, 1)

    # For users/page.tsx
    if "UsersPage" in content:
        # replace handleDelete
        old_handle_delete = """  const handleDelete = async (id: number) => {
    if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
    try {
      await axios.post(`/api/users/${id}/delete/`, {}, { withCredentials: true });
      fetchData();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };"""
        new_handle_delete = """  const handleDelete = async (id: number) => {
    setConfirmModal({ isOpen: true, id, message: "Rostdan ham ushbu foydalanuvchini o'chirmoqchimisiz?" });
  };
  
  const executeDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await axios.post(`/api/users/${confirmModal.id}/delete/`, {}, { withCredentials: true });
      fetchData();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };"""
        content = content.replace(old_handle_delete, new_handle_delete)
        
        # Add modal before closing tag
        if "<ConfirmModal" not in content:
            modal_jsx = """
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        message={confirmModal.message}
      />
    </div>"""
            content = content.replace("    </div>\n  );\n}", modal_jsx + "\n  );\n}")

    # For groups/page.tsx
    if "GroupsPage" in content:
        old_handle_delete = """  const handleDelete = async (id: number) => {
    if (!window.confirm("Rostdan ham guruhni o'chirmoqchimisiz?")) return;
    try {
      await axios.post(`/api/groups/${id}/`, { action: 'delete' }, { withCredentials: true });
      fetchData();
    } catch (e) {
      alert("Xatolik");
    }
  };"""
        new_handle_delete = """  const handleDelete = async (id: number) => {
    setConfirmModal({ isOpen: true, id, message: "Rostdan ham ushbu guruhni o'chirmoqchimisiz?" });
  };
  
  const executeDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await axios.post(`/api/groups/${confirmModal.id}/`, { action: 'delete' }, { withCredentials: true });
      fetchData();
    } catch (e) {
      alert("Xatolik");
    }
  };"""
        content = content.replace(old_handle_delete, new_handle_delete)
        if "<ConfirmModal" not in content:
            modal_jsx = """
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        message={confirmModal.message}
      />
    </div>"""
            content = content.replace("    </div>\n  );\n}", modal_jsx + "\n  );\n}")

    # For courses/page.tsx
    if "CoursesPage" in content:
        old_handle_delete = """  const handleDelete = async (id: number) => {
    if (!window.confirm("Rostdan ham ushbu kursni o'chirmoqchimisiz?")) return;
    try {
      await axios.post(`/api/courses/${id}/`, { action: 'delete' }, { withCredentials: true });
      fetchData();
    } catch (e) {
      alert("Xatolik");
    }
  };"""
        new_handle_delete = """  const handleDelete = async (id: number) => {
    setConfirmModal({ isOpen: true, id, message: "Rostdan ham ushbu kursni o'chirmoqchimisiz?" });
  };
  
  const executeDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await axios.post(`/api/courses/${confirmModal.id}/`, { action: 'delete' }, { withCredentials: true });
      fetchData();
    } catch (e) {
      alert("Xatolik");
    }
  };"""
        content = content.replace(old_handle_delete, new_handle_delete)
        if "<ConfirmModal" not in content:
            modal_jsx = """
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        message={confirmModal.message}
      />
    </div>"""
            content = content.replace("    </div>\n  );\n}", modal_jsx + "\n  );\n}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

pages = [
    'frontend/src/app/admin/users/page.tsx',
    'frontend/src/app/admin/groups/page.tsx',
    'frontend/src/app/admin/courses/page.tsx'
]

for p in pages:
    update_file(p)
print("Updated pages")
