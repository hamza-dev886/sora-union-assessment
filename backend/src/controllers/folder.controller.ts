import { Request, Response } from "express";
import * as folderService from "../services/folder.service";

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await folderService.createFolder(name, req.user.userId, parentId);

    res.status(201).json({
      message: "Folder created successfully",
      folder,
    });
  } catch (error: any) {
    console.error("Create folder error:", error);
    res.status(500).json({ message: "Server error during folder creation" });
  }
};

export const getFolders = async (req: Request, res: Response) => {
  try {
    const parentId = req.query.parentId as string | undefined;
    const folders = await folderService.getFolders(req.user.userId, parentId);

    res.json(folders);
  } catch (error: any) {
    console.error("Get folders error:", error);
    res.status(500).json({ message: "Server error while fetching folders" });
  }
};

export const getFolderContents = async (req: Request, res: Response) => {
  try {
    const contents = await folderService.getFolderContents(req.params.id, req.user.userId);
    res.json(contents);
  } catch (error: any) {
    console.error("Get folder contents error:", error);
    if (error.message === "Folder not found") {
      return res.status(404).json({ message: "Folder not found" });
    }
    res.status(500).json({ message: "Server error while fetching folder contents" });
  }
};

export const renameFolder = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const folder = await folderService.renameFolder(req.params.id, req.user.userId, name);

    res.json({
      message: "Folder renamed successfully",
      folder,
    });
  } catch (error: any) {
    console.error("Rename folder error:", error);
    if (error.message === "Folder not found") {
      return res.status(404).json({ message: "Folder not found" });
    }
    res.status(500).json({ message: "Server error while renaming folder" });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    await folderService.deleteFolder(req.params.id, req.user.userId);
    res.json({ message: "Folder and all contents deleted successfully" });
  } catch (error: any) {
    console.error("Delete folder error:", error);
    if (error.message === "Folder not found") {
      return res.status(404).json({ message: "Folder not found" });
    }
    res.status(500).json({ message: "Server error while deleting folder" });
  }
};

export const getFolderPath = async (req: Request, res: Response) => {
  try {
    const folderId = req.params.id;
    const path = await folderService.getFolderPath(folderId, req.user.userId);
    res.json(path);
  } catch (error: any) {
    console.error("Get folder path error:", error);
    if (error.message === "Folder not found") {
      return res.status(404).json({ message: "Folder not found" });
    }
    res.status(500).json({ message: "Server error while fetching folder path" });
  }
};
