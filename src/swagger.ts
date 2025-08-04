import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PetStore API',
      version: '1.0.0',
      description: 'A RESTful API for managing pets and their images',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
      schemas: {
        Pet: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['DOG', 'CAT', 'BIRD', 'FISH', 'RABBIT', 'HAMSTER', 'OTHER'] },
            age: { type: 'integer', minimum: 0, maximum: 50 },
            breed: { type: 'string' },
            description: { type: 'string' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  filename: { type: 'string' },
                  path: { type: 'string' }
                }
              }
            }
          }
        },
        CreatePet: {
          type: 'object',
          required: ['name', 'type', 'age', 'breed'],
          properties: {
            name: { type: 'string' },
            type: { type: 'string', enum: ['DOG', 'CAT', 'BIRD', 'FISH', 'RABBIT', 'HAMSTER', 'OTHER'] },
            age: { type: 'integer', minimum: 0, maximum: 50 },
            breed: { type: 'string' },
            description: { type: 'string' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);