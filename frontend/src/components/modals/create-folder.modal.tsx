"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createFolder } from "@/actions/folders.actions";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
}

export function CreateFolderModal({ isOpen, onClose, parentId = null }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  console.log("CreateFolderModal parentId", parentId);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId: string | null }) => {
      return createFolder(name, parentId);
    },
    onSuccess: (data) => {
      if (data.success) {
        setFolderName("");
        
        if (parentId) {
          queryClient.invalidateQueries({
            queryKey: ['folder', parentId],
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: ['folders', null],
          });
        }
        
        router.refresh();
        onClose();
      } else {
        setError(data.message);
      }
    },
    onError: (error) => {
      console.error("Error creating folder:", error);
      setError("Failed to create folder. Please try again.");
    }
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setError(null);
    createFolderMutation.mutate({ 
      name: folderName.trim(), 
      parentId 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Folder Name
            </label>
            <input
              id="folder-name"
              type="text"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={createFolderMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFolderMutation.isPending || !folderName.trim()}>
              {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
