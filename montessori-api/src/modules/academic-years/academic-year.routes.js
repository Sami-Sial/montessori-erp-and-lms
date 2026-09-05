import { Router } from 'express';
import prisma from '../../config/db.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requirePermission } from '../../middleware/requirePermission.js';
import { scopeTenant } from '../../middleware/tenantScope.js';
import { validate } from '../../middleware/validate.js';
import { academicYearCreateSchema, academicYearUpdateSchema } from '../../lib/validation/admin.schema.js';

const router = Router();
router.use(authenticate, scopeTenant);

router.get('/', async (req, res, next) => {
  try {
    const years = await prisma.academicYear.findMany({
      where: { organizationId: req.organizationId },
      orderBy: { startDate: 'desc' },
    });
    res.json(years);
  } catch (err) { next(err); }
});

router.post('/', requirePermission('student:write'), validate(academicYearCreateSchema), async (req, res, next) => {
  try {
    const data = req.body;
    
    // If setting as current, unset others
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { organizationId: req.organizationId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const year = await prisma.academicYear.create({
      data: {
        organizationId: req.organizationId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent,
      }
    });

    res.status(201).json(year);
  } catch (err) { next(err); }
});

router.patch('/:id', requirePermission('student:write'), validate(academicYearUpdateSchema), async (req, res, next) => {
  try {
    const data = req.body;
    
    // If setting as current, unset others
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { organizationId: req.organizationId, isCurrent: true, id: { not: req.params.id } },
        data: { isCurrent: false },
      });
    }

    const year = await prisma.academicYear.update({
      where: { id: req.params.id, organizationId: req.organizationId },
      data,
    });

    res.json(year);
  } catch (err) { next(err); }
});

export default router;
