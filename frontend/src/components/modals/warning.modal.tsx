"use client";

import { Button } from "@/components/ui/button";

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function WarningModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isLoading = false }: WarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">{title}</h2>
          <div className="mb-6 text-gray-700 dark:text-gray-300">{message}</div>
        </div>

        <div className="flex justify-center gap-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="px-4 py-2">
            {cancelText}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isLoading} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white">
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
