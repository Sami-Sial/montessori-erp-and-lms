/**
 * @openapi
 * tags:
 *   name: Attendance
 *   description: Student attendance — mark, QR scan, analytics
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate, validateQuery } from '../../middleware/validate.js';
import {
  markAttendanceSchema,
  bulkAttendanceSchema,
  qrScanSchema,
} from '../../lib/validation/attendance.schema.js';
import * as attendanceService from './attendance.service.js';

const router = Router();
router.use(authenticate, scopeTenant);

/**
 * @openapi
 * /attendance/mark:
 *   post:
 *     summary: Mark attendance for a single student
 *     tags: [Attendance]
 */
router.post(
  '/mark',
  requirePermission('attendance:mark'),
  validate(markAttendanceSchema),
  async (req, res, next) => {
    try {
      const record = await attendanceService.markAttendance(req.body, {
        organizationId: req.organizationId,
        actorId: req.user.sub,
      });
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /attendance/bulk:
 *   post:
 *     summary: Bulk mark attendance for an entire classroom
 *     tags: [Attendance]
 */
router.post(
  '/bulk',
  requirePermission('attendance:mark'),
  validate(bulkAttendanceSchema),
  async (req, res, next) => {
    try {
      const result = await attendanceService.bulkMarkAttendance(req.body, {
        organizationId: req.organizationId,
        actorId: req.user.sub,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /attendance/qr-scan:
 *   post:
 *     summary: Process a QR code scan for check-in/check-out
 *     tags: [Attendance]
 */
router.post(
  '/qr-scan',
  requirePermission('attendance:mark'),
  validate(qrScanSchema),
  async (req, res, next) => {
    try {
      const record = await attendanceService.qrCheckIn(req.body, {
        organizationId: req.organizationId,
        actorId: req.user.sub,
      });
      res.json(record);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /attendance/daily:
 *   get:
 *     summary: Get today's (or a specific date's) attendance roster for a classroom or entire school
 *     tags: [Attendance]
 */
router.get(
  '/daily',
  requirePermission('attendance:read'),
  async (req, res, next) => {
    try {
      const result = await attendanceService.getClassroomAttendance({
        classroomId: req.query.classroomId,
        date: req.query.date,
        organizationId: req.organizationId,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /attendance/classroom/{classroomId}:
 *   get:
 *     summary: Get today's (or a specific date's) attendance roster for a classroom
 *     tags: [Attendance]
 */
router.get(
  '/classroom/:classroomId',
  requirePermission('attendance:read'),
  async (req, res, next) => {
    try {
      const result = await attendanceService.getClassroomAttendance({
        classroomId: req.params.classroomId,
        date: req.query.date,
        organizationId: req.organizationId,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /attendance/student/{studentId}:
 *   get:
 *     summary: Get attendance history for a student
 *     tags: [Attendance]
 */
router.get(
  '/student/:studentId',
  requirePermission('attendance:read'),
  async (req, res, next) => {
    try {
      const result = await attendanceService.getStudentAttendance({
        studentId: req.params.studentId,
        organizationId: req.organizationId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /attendance/analytics:
 *   get:
 *     summary: Get monthly attendance analytics and chronic-absence flags
 *     tags: [Attendance]
 */
router.get(
  '/analytics',
  requirePermission('attendance:read'),
  async (req, res, next) => {
    try {
      const now = new Date();
      const branchId = req.query.branchId === 'ALL' ? undefined : req.query.branchId;
      const result = await attendanceService.getAttendanceAnalytics({
        organizationId: req.organizationId,
        classroomId: req.query.classroomId,
        month: parseInt(req.query.month ?? now.getMonth() + 1),
        year: parseInt(req.query.year ?? now.getFullYear()),
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /attendance/trend:
 *   get:
 *     summary: Get attendance trend across months
 *     tags: [Attendance]
 */
router.get(
  '/trend',
  requirePermission('attendance:read'),
  async (req, res, next) => {
    try {
      const branchId = req.query.branchId === 'ALL' ? undefined : req.query.branchId;
      const result = await attendanceService.getAttendanceTrend({
        organizationId: req.organizationId,
        academicYearId: req.query.academicYearId,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);


/**
 * @openapi
 * /attendance/history:
 *   get:
 *     summary: Get attendance history (paginated)
 *     tags: [Attendance]
 */
router.get(
  '/history',
  requirePermission('attendance:read'),
  async (req, res, next) => {
    try {
      const result = await attendanceService.getAttendanceHistory({
        organizationId: req.organizationId,
        classroomId: req.query.classroomId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        skip: req.query.skip,
        take: req.query.take,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
