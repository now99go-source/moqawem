import { Trash2, X } from "lucide-react";

export default function DeleteConfirmModal({ title, message, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700"
          >
            نعم، احذف
          </button>
          <button onClick={onClose} className="flex-1 border border-border rounded-lg py-2 text-sm hover:bg-secondary">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}