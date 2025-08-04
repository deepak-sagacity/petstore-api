import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Pet API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.pet.deleteMany({ where: { ownerId: userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  describe('POST /api/pets', () => {
    it('should create a new pet', async () => {
      const petData = {
        name: 'Buddy',
        type: 'DOG',
        age: 3,
        breed: 'Golden Retriever',
        description: 'Friendly dog'
      };

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(petData)
        .expect(201);

      expect(response.body).toMatchObject(petData);
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 for invalid pet data', async () => {
      const invalidData = {
        name: '',
        type: 'INVALID_TYPE',
        age: -1
      };

      await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 401 without auth token', async () => {
      const petData = {
        name: 'Buddy',
        type: 'DOG',
        age: 3,
        breed: 'Golden Retriever'
      };

      await request(app)
        .post('/api/pets')
        .send(petData)
        .expect(401);
    });
  });

  describe('GET /api/pets', () => {
    let petId: string;

    beforeAll(async () => {
      const pet = await prisma.pet.create({
        data: {
          name: 'Test Pet',
          type: 'CAT',
          age: 2,
          breed: 'Persian',
          ownerId: userId
        }
      });
      petId = pet.id;
    });

    it('should get pets with pagination', async () => {
      const response = await request(app)
        .get('/api/pets?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter pets by type', async () => {
      const response = await request(app)
        .get('/api/pets?type=CAT')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((pet: any) => {
        expect(pet.type).toBe('CAT');
      });
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/pets')
        .expect(401);
    });
  });
});