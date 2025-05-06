"use client";

import { FilePreviewModal } from "@/components/modals/file-preview.modal";
import { WarningModal } from "@/components/modals/warning.modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, ExternalLink, File, FileAudio, FileImage, FileText, FileVideo, Trash2 } from "lucide-react";
import { useState } from "react";

interface FileItemProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: number;
    createdAt: string;
  };
  onDelete?: (fileId: string) => void;
  onRename?: (fileId: string, newName: string) => void;
}

const FileItem = ({ file, onDelete, onRename }: FileItemProps) => {

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [newFileName, setNewFileName] = useState(file.name);
  const isLoading = false;
  
  const formattedDate = new Date(file.createdAt).toLocaleDateString();

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    else if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    else if (sizeInBytes < 1024 * 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    else return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getFileIcon = () => {
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.includes('image')) {
      return <FileImage size={24} className="text-green-500" />;
    } else if (mimeType.includes('audio')) {
      return <FileAudio size={24} className="text-purple-500" />;
    } else if (mimeType.includes('video')) {
      return <FileVideo size={24} className="text-red-500" />;
    } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText size={24} className="text-orange-500" />;
    } else {
      return <File size={24} className="text-gray-500" />;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteWarning(true);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewFileName(file.name);
    setShowRenameModal(true);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreviewModal(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(file.id);
    }
    setShowDeleteWarning(false);
  };

  const cancelDelete = () => {
    setShowDeleteWarning(false);
  };

  const confirmRename = () => {
    if (onRename && newFileName.trim() !== "") {
      onRename(file.id, newFileName.trim());
    }
    setShowRenameModal(false);
  };

  const cancelRename = () => {
    setShowRenameModal(false);
  };

  return (
    <>
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-start space-x-4">
        <div>
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
          <p className="text-sm text-gray-500">
            {formatFileSize(file.size)} • {formattedDate}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handlePreview} 
            className="text-purple-500 hover:text-purple-700 transition-colors" 
            aria-label="Preview file"
            disabled={isLoading}
          >
            <ExternalLink size={18} />
          </button>
          {onRename && (
            <button onClick={handleRename} className="text-blue-500 hover:text-blue-700 transition-colors" aria-label="Rename file">
              <Edit size={18} />
            </button>
          )}
          {onDelete && (
            <button onClick={handleDelete} className="text-red-500 hover:text-red-700 transition-colors" aria-label="Delete file">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Delete Warning Modal */}
      <WarningModal
        isOpen={showDeleteWarning}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={`Delete file "${file.name}"?`}
        message="Warning: This will permanently delete this file. This action cannot be undone."
        confirmText="Delete File"
      />

      {/* Rename File Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={cancelRename}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Rename File</h2>
              <Input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="File name"
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
              <Button type="button" onClick={confirmRename} disabled={!newFileName.trim()} className="px-4 py-2">
                Rename
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        file={file}
      />
    </>
  );
};

export default FileItem;