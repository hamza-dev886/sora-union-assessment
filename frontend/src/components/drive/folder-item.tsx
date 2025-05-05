"use client";

import { FC, useState } from "react";
import { Folder, Trash2, Edit } from "lucide-react";
import { WarningModal } from "@/components/modals/warning.modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FolderItemProps {
  folder: {
    id: string;
    name: string;
    createdAt: string;
  };
  onClick: () => void;
  onDelete?: (folderId: string) => void;
  onRename?: (folderId: string, newName: string) => void;
}

const FolderItem: FC<FolderItemProps> = ({ folder, onClick, onDelete, onRename }) => {
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState(folder.name);
  const formattedDate = new Date(folder.createdAt).toLocaleDateString();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteWarning(true);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewFolderName(folder.name);
    setShowRenameModal(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(folder.id);
    }
    setShowDeleteWarning(false);
  };

  const cancelDelete = () => {
    setShowDeleteWarning(false);
  };

  const confirmRename = () => {
    if (onRename && newFolderName.trim() !== "") {
      onRename(folder.id, newFolderName.trim());
    }
    setShowRenameModal(false);
  };

  const cancelRename = () => {
    setShowRenameModal(false);
  };

  return (
    <>
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-start space-x-4" onClick={onClick}>
        <div className="text-blue-500">
          <Folder size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
          <p className="text-sm text-gray-500">Created: {formattedDate}</p>
        </div>
        <div className="flex space-x-2">
          {onRename && (
            <button onClick={handleRename} className="text-blue-500 hover:text-blue-700 transition-colors" aria-label="Rename folder">
              <Edit size={18} />
            </button>
          )}
          {onDelete && (
            <button onClick={handleDelete} className="text-red-500 hover:text-red-700 transition-colors" aria-label="Delete folder">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <WarningModal
        isOpen={showDeleteWarning}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={`Delete folder "${folder.name}"?`}
        message="Warning: This will permanently delete the folder and ALL files and subfolders contained inside it. This action cannot be undone."
        confirmText="Delete Folder"
      />

      {/* Rename Folder Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={cancelRename}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Rename Folder</h2>
              <Input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmRename();
                }}
              />
            </div>

            <div className="flex justify-center gap-4">
              <Button type="button" variant="outline" onClick={cancelRename} className="px-4 py-2">
                Cancel
              </Button>
              <Button type="button" onClick={confirmRename} disabled={!newFolderName.trim()} className="px-4 py-2">
                Rename
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FolderItem;
