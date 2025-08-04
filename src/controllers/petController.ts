import { Request, Response } from 'express';
import { PetService } from '../services/petService';
import { PetQueryDto } from '../types';

export class PetController {
  private petService = new PetService();

  createPet = async (req: Request, res: Response) => {
    try {
      const pet = await this.petService.createPet(req.body, req.user!.userId);
      res.status(201).json(pet);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getPets = async (req: Request, res: Response) => {
    try {
      const query: PetQueryDto = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        type: req.query.type as any,
        minAge: req.query.minAge ? parseInt(req.query.minAge as string) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined,
        breed: req.query.breed as string
      };

      const ownerId = req.user?.role === 'ADMIN' ? undefined : req.user?.userId;
      const result = await this.petService.getPets(query, ownerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getPetById = async (req: Request, res: Response) => {
    try {
      const pet = await this.petService.getPetById(req.params.id);
      if (!pet) {
        return res.status(404).json({ error: 'Pet not found' });
      }
      
      if (req.user?.role !== 'ADMIN' && pet.ownerId !== req.user?.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updatePet = async (req: Request, res: Response) => {
    try {
      const pet = await this.petService.updatePet(req.params.id, req.body, req.user!.userId);
      res.json(pet);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  deletePet = async (req: Request, res: Response) => {
    try {
      await this.petService.deletePet(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  uploadImages = async (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: 'No images uploaded' });
      }

      const images = req.files.map(file => ({
        filename: file.filename,
        path: file.path
      }));

      const pet = await this.petService.addImages(req.params.id, images, req.user!.userId);
      res.json(pet);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}