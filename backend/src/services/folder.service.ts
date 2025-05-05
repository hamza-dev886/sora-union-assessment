import prisma from "../config/prisma";

export const createFolder = async (name: string, userId: string, parentId?: string) => {
  const newFolder = await prisma.folder.create({
    data: {
      name,
      ownerId: userId,
      parentId: parentId || null,
    },
  });

  return newFolder;
};

export const getFolders = async (userId: string, parentId?: string) => {
  const folders = await prisma.folder.findMany({
    where: {
      ownerId: userId,
      parentId: parentId || null,
    },
  });

  return folders;
};

export const getFolderContents = async (folderId: string, userId: string) => {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId: userId,
    },
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  const files = await prisma.file.findMany({
    where: {
      folderId,
      ownerId: userId,
    },
  });

  const subfolders = await prisma.folder.findMany({
    where: {
      parentId: folderId,
      ownerId: userId,
    },
  });

  return {
    folder,
    files,
    subfolders,
  };
};

export const renameFolder = async (folderId: string, userId: string, name: string) => {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId: userId,
    },
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  const updatedFolder = await prisma.folder.update({
    where: {
      id: folderId,
    },
    data: {
      name,
    },
  });

  return updatedFolder;
};

export const deleteFolder = async (folderId: string, userId: string) => {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId: userId,
    },
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  async function deleteRecursively(id: string) {
    await prisma.file.deleteMany({
      where: {
        folderId: id,
        ownerId: userId,
      },
    });

    const subfolders = await prisma.folder.findMany({
      where: {
        parentId: id,
        ownerId: userId,
      },
    });

    for (const subfolder of subfolders) {
      await deleteRecursively(subfolder.id);
    }

    await prisma.folder.delete({
      where: {
        id,
      },
    });
  }

  await deleteRecursively(folderId);
  return { success: true };
};

export const getFolderPath = async (folderId: string, userId: string) => {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId: userId,
    },
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  const path = [folder];
  
  if (folder.parentId) {
    const parentFolder = await prisma.folder.findFirst({
      where: {
        id: folder.parentId,
        ownerId: userId,
      },
    });

    if (parentFolder) {
      path.unshift(parentFolder);
    }
  }

  return path;
};