"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/actions/files.actions";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
}

export function UploadFileModal({ isOpen, onClose, parentId }: UploadFileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(filesArray);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      for (const file of selectedFiles) {
        const result = await uploadFile(file, parentId);
        
        if (result.error) {
          setError(result.error);
          break;
        }
      }
      
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (!parentId) {
        queryClient.invalidateQueries({
          queryKey: ['files', null],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ['files', parentId],
        });
      }
      
      
      if (!error) {
        router.refresh(); 
        onClose();
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm rounded">
              {error}
            </div>
          )}
          
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-4 text-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
            <label 
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline"
            >
              Choose files
            </label>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              or drag and drop files here
            </p>
            
            {selectedFiles.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-sm font-medium mb-2">Selected files ({selectedFiles.length}):</p>
                <ul className="max-h-40 overflow-y-auto text-sm">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="truncate py-1">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedFiles.length === 0}
            >
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}