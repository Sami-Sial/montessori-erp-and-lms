import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Montessori ERP & LMS API',
      version: '1.0.0',
      description:
        'Production-grade multi-tenant Montessori ERP & Learning Management System API. ' +
        'All tenant-scoped endpoints require a valid JWT. The `organizationId` is derived ' +
        'from the token — never pass it as a request parameter.',
      contact: {
        name: 'Platform Team',
        email: 'dev@montessori.app',
      },
    },
    servers: [
      { url: `http://localhost:${env.PORT}/api/v1`, description: 'Local development' },
      { url: 'https://api.montessori.app/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Request validation failed' },
                details: { type: 'object', nullable: true },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            pageSize: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 150 },
            totalPages: { type: 'integer', example: 8 },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
