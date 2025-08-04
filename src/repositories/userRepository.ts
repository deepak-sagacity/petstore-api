import prisma from '../utils/database';
import { CreateUserDto } from '../types';

export class UserRepository {
  async create(data: CreateUserDto) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }
}