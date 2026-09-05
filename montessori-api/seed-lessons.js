import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding extra lesson plans...');
  
  const org = await prisma.organization.findFirst();
  const academicYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  const classroom = await prisma.classroom.findFirst();
  const teacher = await prisma.staff.findFirst();
  
  if (!org || !academicYear || !classroom || !teacher) {
    console.log('Missing basic setup data.');
    return;
  }
  
  const areas = await prisma.curriculumArea.findMany();
  if (areas.length === 0) {
    console.log('No curriculum areas found.');
    return;
  }
  
  const getArea = (name) => areas.find(a => a.name.includes(name))?.id || areas[0].id;

  const lessonPlans = [
    {
      title: 'Introduction to the Pink Tower',
      objectives: 'Develop visual discrimination of dimensions.',
      instructions: '1. Lay out rug.\n2. Carry cubes one by one starting from smallest.\n3. Build tower centered.\n4. Dismantle and return.',
      notes: 'Ensure child handles one block at a time to build motor skills.',
      ageGroupMin: 2.5,
      ageGroupMax: 3.5,
      areaId: getArea('Sensorial'),
      durationMinutes: 15
    },
    {
      title: 'Sandpaper Letters: a, c, m',
      objectives: 'Introduce phonetic sounds and letter tracing.',
      instructions: '1. Trace letter with index and middle finger.\n2. Make phonetic sound.\n3. Have child trace and repeat sound.',
      notes: 'Watch for correct directionality when tracing.',
      ageGroupMin: 3.0,
      ageGroupMax: 4.5,
      areaId: getArea('Language'),
      durationMinutes: 20
    },
    {
      title: 'Number Rods Introduction',
      objectives: 'Learn names of numbers 1-10 and understand quantity.',
      instructions: '1. Carry rods to mat.\n2. Order from shortest to longest.\n3. Count segments on each rod out loud.',
      notes: 'Reinforce that the final count is the name of the rod.',
      ageGroupMin: 4.0,
      ageGroupMax: 5.5,
      areaId: getArea('Math'),
      durationMinutes: 25
    },
    {
      title: 'Spindle Box',
      objectives: 'Understand the concept of zero and associate quantities with symbols.',
      instructions: '1. Point to number symbol.\n2. Count out corresponding spindles.\n3. Place in compartment.\n4. Note the zero compartment is empty.',
      notes: 'Emphasize that zero means nothing.',
      ageGroupMin: 4.0,
      ageGroupMax: 5.0,
      areaId: getArea('Math'),
      durationMinutes: 20
    },
    {
      title: 'Land and Water Form Trays',
      objectives: 'Identify geographic landforms visually and tactilely.',
      instructions: '1. Pour colored water into tray.\n2. Trace the landform (e.g. island, lake).\n3. Use terminology.',
      notes: 'Use a sponge for cleanup.',
      ageGroupMin: 3.5,
      ageGroupMax: 6.0,
      areaId: getArea('Cultural'),
      durationMinutes: 30
    }
  ];

  for (const lp of lessonPlans) {
    const exists = await prisma.lessonPlan.findFirst({ where: { title: lp.title } });
    if (!exists) {
      await prisma.lessonPlan.create({
        data: {
          id: uuid(),
          organizationId: org.id,
          classroomId: classroom.id,
          academicYearId: academicYear.id,
          curriculumAreaId: lp.areaId,
          createdByStaffId: teacher.id,
          title: lp.title,
          objectives: lp.objectives,
          instructions: lp.instructions,
          notes: lp.notes,
          ageGroupMin: lp.ageGroupMin,
          ageGroupMax: lp.ageGroupMax,
          scheduledDate: new Date(),
          durationMinutes: lp.durationMinutes,
          status: 'PUBLISHED',
        }
      });
      console.log(`Created lesson plan: ${lp.title}`);
    }
  }
  
  console.log('Finished seeding lesson plans.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
