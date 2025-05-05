import prisma from "../config/prisma";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadFile = async (file: Express.Multer.File, userId: string, folderId?: string) => {
  const fileId = uuidv4();
  const key = `${userId}/${fileId}-${file.originalname}`;
  
  const userDir = path.join(uploadDir, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  
  const filePath = path.join(userDir, `${fileId}-${file.originalname}`);
  fs.writeFileSync(filePath, file.buffer);
  
  const url = `/api/files/${fileId}/view`;

  const newFile = await prisma.file.create({
    data: {
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      key: key,
      url: url,
      ownerId: userId,
      folderId: folderId || null,
    },
  });

  return newFile;
};

export const getFiles = async (userId: string, folderId?: string) => {
  const files = await prisma.file.findMany({
    where: {
      ownerId: userId,
      folderId: folderId || null,
    },
  });

  return files;
};

export const getFile = async (fileId: string, userId: string) => {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      ownerId: userId,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  return file;
};

export const getFileContent = async (fileId: string, userId: string) => {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      ownerId: userId,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  const keyParts = file.key.split('/');
  const filename = keyParts[keyParts.length - 1];
  
  const filePath = path.join(uploadDir, userId, filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found at path: ${filePath}`);
    throw new Error("File content not found");
  }
  
  return {
    buffer: fs.readFileSync(filePath),
    type: file.type,
    name: file.name
  };
};

export const renameFile = async (fileId: string, userId: string, name: string) => {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      ownerId: userId,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  const updatedFile = await prisma.file.update({
    where: {
      id: fileId,
    },
    data: {
      name,
    },
  });

  return updatedFile;
};

export const deleteFile = async (fileId: string, userId: string) => {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      ownerId: userId,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  const keyParts = file.key.split('/');
  const filename = keyParts[keyParts.length - 1];
  
  const filePath = path.join(uploadDir, userId, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.file.delete({
    where: {
      id: fileId,
    },
  });

  return { success: true };
}

export const getFileById = async (fileId: string) => {
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }

  return file;
};

export const getFileContentById = async (fileId: string) => {
  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    throw new Error("File not found");
  }


  const keyParts = file.key.split('/');
  const userId = keyParts[0]; 
  const filename = keyParts[keyParts.length - 1]; 
  
  const filePath = path.join(uploadDir, userId, filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found at path: ${filePath}`);
    throw new Error("File content not found");
  }
  
  return {
    buffer: fs.readFileSync(filePath),
    type: file.type,
    name: file.name
  };
};
