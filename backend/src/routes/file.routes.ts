import { Router, RequestHandler } from 'express';
import * as fileController from '../controllers/file.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authenticateToken as RequestHandler, upload.single('file'), fileController.uploadFile as RequestHandler);
router.get('/', authenticateToken as RequestHandler, fileController.getFiles as RequestHandler);
router.get('/:id', authenticateToken as RequestHandler, fileController.getFile as RequestHandler);
router.get('/:id/download', authenticateToken as RequestHandler, fileController.downloadFile as RequestHandler);
router.get('/:id/view', fileController.viewFile as RequestHandler);
router.get('/:id/preview-url', fileController.getFilePreviewUrl as RequestHandler);
router.get('/:id/download-url', authenticateToken as RequestHandler, fileController.getFileDownloadUrl as RequestHandler);
router.patch('/:id/rename', authenticateToken as RequestHandler, fileController.renameFile as RequestHandler);
router.delete('/:id', authenticateToken as RequestHandler, fileController.deleteFile as RequestHandler);

export default router;