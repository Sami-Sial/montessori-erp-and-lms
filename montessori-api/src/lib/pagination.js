import { z } from 'zod';

export const paginationSchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search:   z.string().optional(),
  sortBy:   z.string().optional(),
  sortDir:  z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Returns { skip, take } for Prisma and the full pagination meta for the response.
 */
export const paginate = (page, pageSize) => ({
  skip: (page - 1) * pageSize,
  take: pageSize,
});

/**
 * Builds the standard paginated response shape.
 */
export const paginatedResponse = (data, total, page, pageSize) => ({
  data,
  pagination: {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  },
});
