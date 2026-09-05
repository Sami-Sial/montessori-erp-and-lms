/**
 * @openapi
 * tags:
 *   name: Students
 *   description: Student profiles, guardians and progress
 */

import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import { paginationSchema } from '../../lib/pagination.js';
import {
  studentCreateSchema,
  studentUpdateSchema,
  guardianCreateSchema,
} from '../../lib/validation/student.schema.js';
import * as studentService from './student.service.js';
import { createUploader } from '../../config/cloudinary.js';
import { z } from 'zod';

const router = Router();
const photoUploader = createUploader('students/photos', ['jpg','jpeg','png','webp']);

const listQuerySchema = paginationSchema.extend({
  classroomId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sortBy: z.enum(['lastName', 'firstName', 'age', 'studentNumber']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
  guardianName: z.string().optional(),
  unenrolledOnly: z.string().optional(),
});

// All routes require authentication + tenant scope
router.use(authenticate, scopeTenant);

/**
 * @openapi
 * /students:
 *   get:
 *     summary: List all students (paginated)
 *     tags: [Students]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, default: 20 } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: classroomId, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Paginated list of students
 */
router.get(
  '/',
  requirePermission('student:read'),
  validateQuery(listQuerySchema),
  async (req, res, next) => {
    try {
      const result = await studentService.listStudents({
        organizationId: req.organizationId,
        user: req.user,
        ...req.query,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     summary: Get a single student profile (full detail)
 *     tags: [Students]
 */
router.get(
  '/:id',
  requirePermission('student:read'),
  async (req, res, next) => {
    try {
      const student = await studentService.getStudentById(req.params.id, req.organizationId);
      res.json(student);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 */
router.post(
  '/',
  requirePermission('student:write'),
  validate(studentCreateSchema),
  async (req, res, next) => {
    try {
      const student = await studentService.createStudent(
        req.organizationId,
        req.body,
        req.user.sub
      );
      res.status(201).json(student);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /students/{id}:
 *   patch:
 *     summary: Update student details
 *     tags: [Students]
 */
router.patch(
  '/:id',
  requirePermission('student:write'),
  validate(studentUpdateSchema),
  async (req, res, next) => {
    try {
      const student = await studentService.updateStudent(
        req.params.id,
        req.organizationId,
        req.body,
        req.user.sub
      );
      res.json(student);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /students/{id}:
 *   delete:
 *     summary: Soft-delete a student
 *     tags: [Students]
 */
router.delete(
  '/:id',
  requirePermission('student:delete'),
  async (req, res, next) => {
    try {
      const result = await studentService.deleteStudent(
        req.params.id,
        req.organizationId,
        req.user.sub
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /students/{id}/photo:
 *   post:
 *     summary: Upload student photo to Cloudinary
 *     tags: [Students]
 */
router.post(
  '/:id/photo',
  requirePermission('student:write'),
  photoUploader.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: { code: 'NO_FILE', message: 'No photo uploaded', details: null } });
      }
      const updated = await studentService.updateStudent(
        req.params.id,
        req.organizationId,
        { photoUrl: req.file.path },
        req.user.sub
      );
      res.json({ photoUrl: updated.photoUrl });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /students/{id}/guardians:
 *   post:
 *     summary: Add a guardian to a student
 *     tags: [Students]
 */
router.post(
  '/:id/guardians',
  requirePermission('student:write'),
  validate(guardianCreateSchema),
  async (req, res, next) => {
    try {
      const result = await studentService.addGuardian(
        req.params.id,
        req.organizationId,
        req.body,
        req.user.sub
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /students/{id}/progress:
 *   get:
 *     summary: Get student curriculum progress and recent observations
 *     tags: [Students]
 */
router.get(
  '/:id/progress',
  requirePermission('student:read'),
  async (req, res, next) => {
    try {
      const result = await studentService.getStudentProgress(req.params.id, req.organizationId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
