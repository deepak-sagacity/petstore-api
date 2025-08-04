import { Router } from 'express';
import { PetController } from '../controllers/petController';
import { AuthController } from '../controllers/authController';
import { CacheController } from '../controllers/cacheController';
import { authenticateToken, authenticateApiKey, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { upload } from '../middleware/upload';
import { CreatePetValidation, UpdatePetValidation, CreateUserValidation, LoginValidation } from '../utils/validation';

const router = Router();
const petController = new PetController();
const authController = new AuthController();
const cacheController = new CacheController();

// Auth routes
router.post('/auth/register', validateBody(CreateUserValidation), authController.register);
router.post('/auth/login', validateBody(LoginValidation), authController.login);

// Pet routes with JWT auth
router.post('/pets', authenticateToken, validateBody(CreatePetValidation), petController.createPet);
router.get('/pets', authenticateToken, petController.getPets);
router.get('/pets/:id', authenticateToken, petController.getPetById);
router.put('/pets/:id', authenticateToken, validateBody(UpdatePetValidation), petController.updatePet);
router.delete('/pets/:id', authenticateToken, petController.deletePet);
router.post('/pets/:id/images', authenticateToken, upload.array('images', 5), petController.uploadImages);

// Admin routes with API key auth
router.get('/admin/pets', authenticateApiKey, requireRole('ADMIN'), petController.getPets);

// Cache debug routes (development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/cache/keys', cacheController.getCacheKeys);
  router.get('/cache/check/:key', cacheController.checkCacheKey);
  router.delete('/cache/clear/:key', cacheController.clearCacheKey);
}

export default router;