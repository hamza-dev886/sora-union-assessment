import { Router, RequestHandler } from 'express';
import * as folderController from '../controllers/folder.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken as RequestHandler, folderController.createFolder as RequestHandler);
router.get('/', authenticateToken as RequestHandler, folderController.getFolders as RequestHandler);
router.get('/:id/contents', authenticateToken as RequestHandler, folderController.getFolderContents as RequestHandler);
router.get('/:id/path', authenticateToken as RequestHandler, folderController.getFolderPath as RequestHandler);
router.patch('/:id/rename', authenticateToken as RequestHandler, folderController.renameFolder as RequestHandler);
router.delete('/:id', authenticateToken as RequestHandler, folderController.deleteFolder as RequestHandler);

export default router;