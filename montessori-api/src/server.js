import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { env } from './config/env.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { applyTenantMiddleware } from './middleware/tenantScope.js';
import prisma from './config/db.js';

// Apply Prisma tenant middleware once at startup
applyTenantMiddleware(prisma);

// ─── Route imports (populated as modules are built) ───────────────────────────
import authRoutes from './modules/auth/auth.routes.js';
import studentRoutes from './modules/students/student.routes.js';
import classroomRoutes from './modules/classrooms/classroom.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import curriculumRoutes from './modules/curriculum/curriculum.routes.js';
import observationRoutes from './modules/observations/observation.routes.js';
import financeRoutes from './modules/finance/finance.routes.js';
import hrRoutes from './modules/hr/hr.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import communicationRoutes from './modules/communication/communication.routes.js';
import gamificationRoutes from './modules/gamification/gamification.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import syncRoutes from './modules/sync/sync.routes.js';

// ─── Swagger ──────────────────────────────────────────────────────────────────
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

// ─── BullMQ workers (auto-start) ──────────────────────────────────────────────
import './jobs/index.js';

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
export const io = new SocketIO(httpServer, {
  cors: {
    origin: env.CORS_ORIGINS,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  const { room } = socket.handshake.query;
  if (room) socket.join(room);
  socket.on('disconnect', () => {});
});

// ─── Security & parsing middleware ────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // allow Cloudinary images
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server, curl
      if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.isDev ? 'dev' : 'combined'));
app.use(globalRateLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' })
);

// ─── API routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/students`, studentRoutes);
app.use(`${API}/classrooms`, classroomRoutes);
app.use(`${API}/attendance`, attendanceRoutes);
app.use(`${API}/curriculum`, curriculumRoutes);
app.use(`${API}/observations`, observationRoutes);
app.use(`${API}/finance`, financeRoutes);
app.use(`${API}/hr`, hrRoutes);
app.use(`${API}/inventory`, inventoryRoutes);
app.use(`${API}/communication`, communicationRoutes);
app.use(`${API}/gamification`, gamificationRoutes);
app.use(`${API}/ai`, aiRoutes);
app.use(`${API}/sync`, syncRoutes);

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Montessori API Docs',
  })
);

// ─── 404 & error handler ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = env.PORT;

httpServer.listen(PORT, () => {
  console.log(`\n🏫 Montessori API running on port ${PORT}`);
  console.log(`   📚 API:     http://localhost:${PORT}/api/v1`);
  console.log(`   📖 Docs:    http://localhost:${PORT}/api/docs`);
  console.log(`   💚 Health:  http://localhost:${PORT}/health`);
  console.log(`   Mode:       ${env.NODE_ENV}\n`);
});

export default app;
