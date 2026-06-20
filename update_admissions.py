import os

filepath = 'frontend/src/app/admin/admissions/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "ConfirmModal" not in content:
    content = content.replace('import { useState', 'import ConfirmModal from "@/components/ConfirmModal";\nimport { useState')
    
    state_str = """  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null as number | null, action: null as 'approve' | 'reject' | null, message: "" });
"""
    content = content.replace('  const [actionLoading, setActionLoading] = useState<number | null>(null);\n', 
                              '  const [actionLoading, setActionLoading] = useState<number | null>(null);\n' + state_str)
    
    old_handle = """  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!window.confirm(`Rostdan ham ushbu so'rovni ${action === 'approve' ? 'qabul qilasizmi' : 'rad etasizmi'}?`)) return;
    
    setActionLoading(id);
    try {
      const res = await axios.post(`/api/admissions/${id}/action/`, { action }, { withCredentials: true });
      if (action === 'approve') {
        alert(`Qabul qilindi! O'quvchi uchun login: ${res.data.username}, parol: ${res.data.password}`);
      }
      fetchRequests();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setActionLoading(null);
    }
  };"""

    new_handle = """  const handleActionClick = (id: number, action: 'approve' | 'reject') => {
    setConfirmModal({
      isOpen: true,
      id,
      action,
      message: `Rostdan ham ushbu so'rovni ${action === 'approve' ? 'qabul qilasizmi' : 'rad etasizmi'}?`
    });
  };

  const executeAction = async () => {
    const { id, action } = confirmModal;
    if (!id || !action) return;
    
    setActionLoading(id);
    try {
      const res = await axios.post(`/api/admissions/${id}/action/`, { action }, { withCredentials: true });
      if (action === 'approve') {
        alert(`Qabul qilindi! O'quvchi uchun login: ${res.data.username}, parol: ${res.data.password}`);
      }
      fetchRequests();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setActionLoading(null);
    }
  };"""
  
    content = content.replace(old_handle, new_handle)
    content = content.replace("handleAction(req.id, 'reject')", "handleActionClick(req.id, 'reject')")
    content = content.replace("handleAction(req.id, 'approve')", "handleActionClick(req.id, 'approve')")
    
    modal_jsx = """
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeAction}
        message={confirmModal.message}
        confirmText={confirmModal.action === 'approve' ? "Qabul qilish" : "Rad etish"}
      />
    </div>"""
    content = content.replace("    </div>\n  );\n}", modal_jsx + "\n  );\n}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated admissions")
