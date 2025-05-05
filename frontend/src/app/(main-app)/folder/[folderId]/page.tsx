"use client";

import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FolderItem from "@/components/drive/folder-item";
import FileItem from "@/components/drive/file-item";
import { getFolders, deleteFolder, renameFolder, getFolderPath } from "@/actions/folders.actions";
import { getFiles, deleteFile, renameFile } from "@/actions/files.actions";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import React, { useState } from "react";

export default function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [parentFolder, setParentFolder] = useState<any>(null);
  const isSessionLoading = sessionStatus === "loading";

  const { 
    data: currentFolder,
    isLoading: currentFolderLoading 
  } = useQuery({
    queryKey: ['folder', folderId],
    queryFn: async () => {
      const data = await getFolders(folderId);
      if ("error" in data) {
        throw new Error(data.error);
      }
      const folder = data.find((folder: any) => folder.id === folderId);
      
      if (!folder) {
        throw new Error("Folder not found");
      }
      
      return folder;
    },
    enabled: sessionStatus === "authenticated" && !!session?.user?.accessToken,
    staleTime: 5 * 60 * 1000, 
  });

  const {
    data: folderPathData = [],
    isLoading: folderPathLoading
  } = useQuery({
    queryKey: ['folderPath', folderId],
    queryFn: async () => {
      const data = await getFolderPath(folderId);
      if ("error" in data) {
        throw new Error(data.error);
      }
      
      if (data.length > 0) {
        setParentFolder(data[data.length - 1]);
      }
      
      return data;
    },
    enabled: sessionStatus === "authenticated" && !!session?.user?.accessToken && !!folderId,
    staleTime: 5 * 60 * 1000,
  });

  console.log("Folder Path Loading:", folderPathLoading);


  const { 
    data: folders = [], 
    isLoading: foldersLoading,
    error: foldersError 
  } = useQuery({
    queryKey: ['folders', folderId],
    queryFn: async () => {
      const data = await getFolders(folderId);
      if ("error" in data) {
        throw new Error(data.error);
      }
      return data;
    },
    enabled: sessionStatus === "authenticated" && !!session?.user?.accessToken,
    refetchOnMount: true,
  });

  console.log("Current folder loading:", currentFolderLoading);

  const { 
    data: files = [], 
    isLoading: filesLoading,
    error: filesError 
  } = useQuery({
    queryKey: ['files', folderId],
    queryFn: async () => {
      const data = await getFiles(folderId);
      if ("error" in data) {
        throw new Error(data.error);
      }
      return data;
    },
    enabled: sessionStatus === "authenticated" && !!session?.user?.accessToken,
    refetchOnMount: true,
  });

  const isLoading = isSessionLoading || foldersLoading || filesLoading || currentFolderLoading || folderPathLoading;
  const error = foldersError || filesError;
  const errorMessage = error instanceof Error ? error.message : "Failed to fetch data";

  const handleBackClick = () => {
    if (parentFolder) {
      router.push(`/folder/${parentFolder.id}`);
    } else {
      router.push('/');
    }
  };

  const handleFolderClick = (nestedFolderId: string) => {
    router.push(`/folder/${nestedFolderId}`);
  };

  const handleFolderDelete = async (deleteFolderId: string) => {
    try {
      const result = await deleteFolder(deleteFolderId);
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['folders'] });
        toast.success(result.message || "Folder deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("An unexpected error occurred while deleting the folder");
    }
  };

  const handleFolderRename = async (renameFolderId: string, newName: string) => {
    try {
      const result = await renameFolder(renameFolderId, newName);
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['folders'] });
        toast.success(result.message || "Folder renamed successfully");
      } else {
        toast.error(result.message || "Failed to rename folder");
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("An unexpected error occurred while renaming the folder");
    }
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      const result = await deleteFile(fileId);
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['files'] });
        toast.success(result.message || "File deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("An unexpected error occurred while deleting the file");
    }
  };

  const handleFileRename = async (fileId: string, newName: string) => {
    try {
      const result = await renameFile(fileId, newName);
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['files'] });
        toast.success(result.message || "File renamed successfully");
      } else {
        toast.error(result.message || "Failed to rename file");
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("An unexpected error occurred while renaming the file");
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        {/* Breadcrumbs navigation */}
        <div className="flex items-center mb-4 text-sm overflow-x-auto whitespace-nowrap pb-3 bg-gray-50 p-2 ">
          <Link href="/" className="text-blue-500 hover:text-blue-700 flex-shrink-0 font-medium">
            My Drive
          </Link>
          
          {/* Always rendered divider to make sure breadcrumbs are visible */}
          <span className="mx-2 text-gray-500">/</span>
          
          {folderPathData.length > 0 && (
            <>
              {folderPathData.length > 1 && (
                <>
                  {/* Show ellipsis for long paths */}
                  <span className="text-gray-500">...</span>
                  <span className="mx-2 text-gray-500">/</span>
                </>
              )}
              
              {/* Always show parent folder as second last item - if exists */}
              {folderPathData.length > 0 && (
                <span className="text-gray-700 flex-shrink-0">
                  {folderPathData[folderPathData.length - 1].name}
                </span>
              )}
            </>
          )}
          
          {/* Current folder - always last */}
          {currentFolder && (
            <>
              <span className="mx-2 text-gray-500">/</span>
              <span className="font-medium flex-shrink-0 text-gray-700">{currentFolder.name}</span>
            </>
          )}
        </div>
        
        
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-red-500">{errorMessage}</p>
        </div>
      ) : (
        <div>
          {/* Folders section */}
          {folders && folders.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Folders</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map((folder: any) => (
                  <FolderItem 
                    key={folder.id} 
                    folder={folder} 
                    onClick={() => handleFolderClick(folder.id)} 
                    onDelete={handleFolderDelete}
                    onRename={handleFolderRename}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files section */}
          {files && files.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file: any) => (
                  <FileItem 
                    key={file.id} 
                    file={file} 
                    onDelete={handleFileDelete}
                    onRename={handleFileRename}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {(!folders || folders.length === 0) && (!files || files.length === 0) && (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-gray-500 mb-2">This folder is empty</p>
              <p className="text-gray-400 text-sm">Upload files or create folders to get started</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
