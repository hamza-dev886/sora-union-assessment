"use server";

import { auth } from "@/auth";
import { env } from "@/lib/env";
import { revalidatePath } from "next/cache";

export async function getFiles(folderId?: string | null) {
  const session = await auth();
  const token = session?.user?.accessToken;

  console.log("Big Token:", token);

  try {
    if (!token) {
      return { error: "Authentication required" };
    }

    const url = folderId ? `${env.apiUrl}/files?folderId=${folderId}` : `${env.apiUrl}/files`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { tags: ["files"] },
    });

    if (!response.ok) {
      return { error: "Failed to fetch files" };
    }

    const files = await response.json();
      console.log("Files:", files);
    return files;
  } catch (error) {
    console.error("Error fetching files:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function uploadFile(file: File, folderId?: string | null) {
  const session = await auth();
  const token = session?.user?.accessToken;

  try {
    if (!token) {
      return { error: "Authentication required" };
    }

    if (!file) {
      return { error: "No file provided" };
    }

    const formData = new FormData();
    formData.append("file", file);

    if (folderId) {
      formData.append("folderId", folderId);
    }

    const response = await fetch(`${env.apiUrl}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.message || "Failed to upload file",
        status: response.status,
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error uploading file:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  const token = session?.user?.accessToken;

  try {
    if (!token) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    const response = await fetch(`${env.apiUrl}/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to delete file",
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function renameFile(fileId: string, newName: string): Promise<{ success: boolean; message: string; file?: any }> {
  const session = await auth();
  const token = session?.user?.accessToken;

  try {
    if (!token) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    const response = await fetch(`${env.apiUrl}/files/${fileId}/rename`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to rename file",
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: "File renamed successfully",
      file: data.file,
    };
  } catch (error) {
    console.error("Error renaming file:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function downloadFile(fileId: string, fileName: string) {
  const session = await auth();
  const token = session?.user?.accessToken;

  try {
    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${env.apiUrl}/files/${fileId}/download-url`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { error: "Failed to get file download URL" };
    }

    const result = await response.json();

    return {
      success: true,
      downloadUrl: `${env.apiUrl}${result.downloadUrl}`,
      fileName: result.fileName || fileName,
      token: result.token,
    };
  } catch (error) {
    console.error("Error preparing download:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function getFileViewUrl(fileId: string) {
  try {
    const response = await fetch(`${env.apiUrl}/files/${fileId}/preview-url`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to get file preview URL:", errorData);
      return { error: errorData.message || "Failed to get file preview URL" };
    }

    const result = await response.json();

    if (!result.success) {
      return { error: result.error || "Failed to get file preview URL" };
    }

    return {
      success: true,
      viewUrl: `${env.apiUrl}${result.viewUrl}`,
      fileType: result.fileType,
      fileName: result.fileName,
      fileSize: result.fileSize,
    };
  } catch (error) {
    console.error("Error preparing file view:", error);
    return { error: "An unexpected error occurred" };
  }
}
