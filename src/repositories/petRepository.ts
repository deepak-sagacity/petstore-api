import prisma from '../utils/database';
import { CreatePetDto, UpdatePetDto, PetQueryDto } from '../types';

export class PetRepository {
  async create(data: CreatePetDto & { ownerId: string }) {
    return prisma.pet.create({
      data,
      include: {
        images: true,
        owner: { select: { id: true, email: true } }
      }
    });
  }

  async findById(id: string) {
    return prisma.pet.findUnique({
      where: { id },
      include: {
        images: true,
        owner: { select: { id: true, email: true } }
      }
    });
  }

  async findMany(query: PetQueryDto, ownerId?: string) {
    const { page = 1, limit = 10, type, minAge, maxAge, breed } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ownerId) where.ownerId = ownerId;
    if (type) where.type = type;
    if (breed) where.breed = { contains: breed, mode: 'insensitive' };
    if (minAge !== undefined || maxAge !== undefined) {
      where.age = {};
      if (minAge !== undefined) where.age.gte = minAge;
      if (maxAge !== undefined) where.age.lte = maxAge;
    }

    const [pets, total] = await Promise.all([
      prisma.pet.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: true,
          owner: { select: { id: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pet.count({ where })
    ]);

    return { pets, total };
  }

  async update(id: string, data: UpdatePetDto) {
    return prisma.pet.update({
      where: { id },
      data,
      include: {
        images: true,
        owner: { select: { id: true, email: true } }
      }
    });
  }

  async delete(id: string) {
    return prisma.pet.delete({ where: { id } });
  }

  async addImages(petId: string, images: { filename: string; path: string }[]) {
    return prisma.petImage.createMany({
      data: images.map(img => ({ ...img, petId }))
    });
  }
}