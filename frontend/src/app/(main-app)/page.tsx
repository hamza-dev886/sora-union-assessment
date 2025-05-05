"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFolders, deleteFolder, renameFolder } from "@/actions/folders.actions";
import { getFiles, deleteFile, renameFile } from "@/actions/files.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ContentListing from "@/components/drive/content-listing/content-listing";

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: folders = [],
    isLoading: foldersLoading,
    error: foldersError,
  } = useQuery({
    queryKey: ["folders", null],
    queryFn: async () => {
      const data = await getFolders(null);
      if ("error" in data) {
        throw new Error(data.error);
      }
      return data;
    },
  });

  const {
    data: files = [],
    isLoading: filesLoading,
    error: filesError,
  } = useQuery({
    queryKey: ["files", null],
    queryFn: async () => {
      const data = await getFiles(null);
      if ("error" in data) {
        throw new Error(data.error);
      }
      return data;
    },
  });

  const isLoading = foldersLoading || filesLoading;
  const error = foldersError || filesError;

  const handleFolderClick = (folderId: string) => {
    router.push(`/folder/${folderId}`);
  };

  const handleFolderDelete = async (folderId: string) => {
    try {
      const result = await deleteFolder(folderId);

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["folders"] });
        toast.success(result.message || "Folder deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("An unexpected error occurred while deleting the folder");
    }
  };

  const handleFolderRename = async (folderId: string, newName: string) => {
    try {
      const result = await renameFolder(folderId, newName);

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["folders"] });
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
        queryClient.invalidateQueries({ queryKey: ["files"] });
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
        queryClient.invalidateQueries({ queryKey: ["files"] });
        toast.success(result.message || "File renamed successfully");
      } else {
        toast.error(result.message || "Failed to rename file");
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("An unexpected error occurred while renaming the file");
    }
  };

  console.log("Folders:", folders);
  console.log("Folder loading:", foldersLoading);

  return (
    <main className="flex-1 overflow-y-auto p-6">

      <ContentListing
        folders={folders}
        files={files}
        isLoading={isLoading}
        error={error}
        onFolderClick={handleFolderClick}
        onFolderDelete={handleFolderDelete}
        onFolderRename={handleFolderRename}
        onFileDelete={handleFileDelete}
        onFileRename={handleFileRename}
      />
    </main>
  );
}
