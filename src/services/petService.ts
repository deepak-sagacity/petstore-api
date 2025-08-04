import { PetRepository } from '../repositories/petRepository';
import { CreatePetDto, UpdatePetDto, PetQueryDto, PaginatedResponse } from '../types';
import { cache } from '../utils/redis';
import { Pet } from '@prisma/client';

export class PetService {
  private petRepository = new PetRepository();

  async createPet(data: CreatePetDto, ownerId: string) {
    const pet = await this.petRepository.create({ ...data, ownerId });
    await cache.del(`pets:user:${ownerId}`);
    await cache.del('pets:all');
    return pet;
  }

  async getPetById(id: string) {
    const cacheKey = `pet:${id}`;
    let pet = await cache.get(cacheKey);
    
    if (!pet) {
      pet = await this.petRepository.findById(id);
      if (pet) {
        await cache.set(cacheKey, pet, 300);
      }
    }
    
    return pet;
  }

  async getPets(query: PetQueryDto, ownerId?: string): Promise<PaginatedResponse<Pet>> {
    const cacheKey = `pets:${ownerId || 'all'}:${JSON.stringify(query)}`;
    let result = await cache.get(cacheKey);
    
    if (!result) {
      const { pets, total } = await this.petRepository.findMany(query, ownerId);
      const { page = 1, limit = 10 } = query;
      
      result = {
        data: pets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
      
      await cache.set(cacheKey, result, 300);
    }
    
    return result;
  }

  async updatePet(id: string, data: UpdatePetDto, ownerId: string) {
    const pet = await this.petRepository.findById(id);
    if (!pet) throw new Error('Pet not found');
    if (pet.ownerId !== ownerId) throw new Error('Unauthorized');

    const updatedPet = await this.petRepository.update(id, data);
    
    await cache.del(`pet:${id}`);
    await cache.del(`pets:user:${ownerId}`);
    await cache.del('pets:all');
    
    return updatedPet;
  }

  async deletePet(id: string, ownerId: string) {
    const pet = await this.petRepository.findById(id);
    if (!pet) throw new Error('Pet not found');
    if (pet.ownerId !== ownerId) throw new Error('Unauthorized');

    await this.petRepository.delete(id);
    
    await cache.del(`pet:${id}`);
    await cache.del(`pets:user:${ownerId}`);
    await cache.del('pets:all');
  }

  async addImages(petId: string, images: { filename: string; path: string }[], ownerId: string) {
    const pet = await this.petRepository.findById(petId);
    if (!pet) throw new Error('Pet not found');
    if (pet.ownerId !== ownerId) throw new Error('Unauthorized');

    await this.petRepository.addImages(petId, images);
    await cache.del(`pet:${petId}`);
    
    return this.getPetById(petId);
  }
}