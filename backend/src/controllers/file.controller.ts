import { Request, Response } from 'express';
import * as fileService from '../services/file.service';
import jwt from 'jsonwebtoken';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { folderId } = req.body;
    const file = await fileService.uploadFile(req.file, req.user.userId, folderId);

    res.status(201).json({
      message: 'File uploaded successfully',
      file
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const folderId = req.query.folderId as string | undefined;
    const files = await fileService.getFiles(req.user.userId, folderId);
    
    res.json(files);
  } catch (error: any) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Server error while fetching files' });
  }
};

export const getFile = async (req: Request, res: Response) => {
  try {
    const file = await fileService.getFile(req.params.id, req.user.userId);
    res.json(file);
  } catch (error: any) {
    console.error('Get file error:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(500).json({ message: 'Server error while fetching file' });
  }
};

export const renameFile = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const file = await fileService.renameFile(req.params.id, req.user.userId, name);
    
    res.json({
      message: 'File renamed successfully',
      file
    });
  } catch (error: any) {
    console.error('Rename file error:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(500).json({ message: 'Server error while renaming file' });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    await fileService.deleteFile(req.params.id, req.user.userId);
    res.json({ message: 'File metadata deleted successfully' });
  } catch (error: any) {
    console.error('Delete file error:', error);
    if (error.message === 'File not found') {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(500).json({ message: 'Server error while deleting file' });
  }
};

export const downloadFile = async (req: Request, res: Response) => {
  try {
    let userId = req.user?.userId;
    let fileId = req.params.id;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (decoded.purpose === 'file-download' && decoded.fileId === fileId) {
          userId = decoded.userId;
        }
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const fileContent = await fileService.getFileContent(fileId, userId);
    
    res.setHeader('Content-Type', fileContent.type);
    res.setHeader('Content-Disposition', `attachment; filename="${fileContent.name}"`);
    
    res.send(fileContent.buffer);
  } catch (error: any) {
    console.error('Download file error:', error);
    if (error.message === 'File not found' || error.message === 'File content not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while downloading file' });
  }
};

export const getFilePreviewUrl = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    
    const file = await fileService.getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const viewUrl = `/files/${file.id}/view`;
    
    res.json({
      success: true,
      viewUrl,
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size
    });
  } catch (error: any) {
    console.error('Get file preview URL error:', error);
    res.status(500).json({ error: 'Server error while generating preview URL' });
  }
};

export const getFileDownloadUrl = async (req: Request, res: Response) => {
  try {
    const file = await fileService.getFile(req.params.id, req.user.userId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const token = jwt.sign(
      { 
        userId: req.user.userId, 
        fileId: file.id,
        purpose: 'file-download' 
      }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '1h' }
    );

    const downloadUrl = `/files/${file.id}/download`;
    
    res.json({
      success: true,
      downloadUrl,
      token,
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size
    });
  } catch (error: any) {
    console.error('Get file download URL error:', error);
    res.status(500).json({ error: 'Server error while generating download URL' });
  }
};

export const viewFile = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    
    const fileContent = await fileService.getFileContentById(fileId);
    
    res.setHeader('Content-Type', fileContent.type);
    res.setHeader('Content-Disposition', `inline; filename="${fileContent.name}"`);
    
    res.send(fileContent.buffer);
  } catch (error: any) {
    console.error('View file error:', error);
    if (error.message === 'File not found' || error.message === 'File content not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while viewing file' });
  }
};