"use server";

import { auth } from "@/auth";
import { env } from "@/lib/env";
import { revalidatePath } from "next/cache";

export async function createFolder(name: string, parentId?: string | null): Promise<{ success: boolean; message: string; folder?: any }> {
  const session = await auth();

  const token = session?.user?.accessToken;

  try {
    if (!token) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    const requestData = {
      name,
      ...(parentId && { parentId }),
    };

    const response = await fetch(`${env.apiUrl}/folders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to create folder",
      };
    }

    revalidatePath("/");
    if (parentId) {
      revalidatePath(`/folder/${parentId}`);
    }

    return {
      success: true,
      message: "Folder created successfully",
      folder: data.folder,
    };
  } catch (error) {
    console.error("Error creating folder:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function getFolders(parentId?: string | null) {
  const session = await auth();
  const token = session?.user?.accessToken;

  try {
    if (!token) {
      return { error: "Authentication required" };
    }

    const url = parentId ? `${env.apiUrl}/folders?parentId=${parentId}` : `${env.apiUrl}/folders`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { tags: ["folders"] },
    });

    if (!response.ok) {
      return { error: "Failed to fetch folders" };
    }

    const folders = await response.json();
    return folders;
  } catch (error) {
    console.error("Error fetching folders:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function deleteFolder(folderId: string): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  const token = session?.user?.accessToken;

  try {
    if (!token) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    const response = await fetch(`${env.apiUrl}/folders/${folderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to delete folder",
      };
    }

    revalidatePath("/");
    
    return {
      success: true,
      message: "Folder and all contents deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting folder:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function renameFolder(folderId: string, newName: string): Promise<{ success: boolean; message: string; folder?: any }> {
  const session = await auth();
  const token = session?.user?.accessToken;

  try {
    if (!token) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    const response = await fetch(`${env.apiUrl}/folders/${folderId}/rename`, {
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
        message: data.message || "Failed to rename folder",
      };
    }

    revalidatePath("/");
    
    return {
      success: true,
      message: "Folder renamed successfully",
      folder: data.folder,
    };
  } catch (error) {
    console.error("Error renaming folder:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function getFolderPath(folderId: string) {
  const session = await auth();
  const token = session?.user?.accessToken;

  try {
    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${env.apiUrl}/folders/${folderId}/path`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { tags: ["folders"] },
    });

    if (!response.ok) {
      return { error: "Failed to fetch folder path" };
    }

    const path = await response.json();

    return path;
  } catch (error) {
    console.error("Error fetching folder path:", error);
    return { error: "An unexpected error occurred" };
  }
}
