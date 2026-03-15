require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;

// ──────────────────────────────────────────────
//  Logger
// ──────────────────────────────────────────────
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message }) => `[${timestamp}] [API-GATEWAY] ${level}: ${message}`
        )
      ),
    }),
  ],
});

// ──────────────────────────────────────────────
//  Service URLs
// ──────────────────────────────────────────────
const SERVICES = {
  user:         process.env.USER_SERVICE_URL         || 'http://user-service:3001',
  course:       process.env.COURSE_SERVICE_URL       || 'http://course-service:3002',
  assessment:   process.env.ASSESSMENT_SERVICE_URL   || 'http://assessment-service:3003',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004',
  analytics:    process.env.ANALYTICS_SERVICE_URL    || 'http://analytics-service:3005',
};

// ──────────────────────────────────────────────
//  Middleware
// ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ──────────────────────────────────────────────
//  Rate Limiters
// ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});

app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// ──────────────────────────────────────────────
//  JWT Authentication Middleware
// ──────────────────────────────────────────────
const PUBLIC_PATHS = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/refresh-token',
  '/health',
];

const authenticateGateway = (req, res, next) => {
  const isPublic = PUBLIC_PATHS.some((p) => req.path.startsWith(p));
  if (isPublic) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Forward user info to downstream services
    req.headers['x-user-id']   = decoded.userId;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

app.use(authenticateGateway);

// ──────────────────────────────────────────────
//  Request Logging
// ──────────────────────────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} → routed`);
  next();
});

// ──────────────────────────────────────────────
//  Proxy Configuration Helper
// ──────────────────────────────────────────────
const makeProxy = (target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: fixRequestBody,
      error: (err, req, res) => {
        logger.error(`Proxy error for ${target}: ${err.message}`);
        res.status(502).json({ success: false, message: 'Service temporarily unavailable' });
      },
    },
  });

// ──────────────────────────────────────────────
//  Route Proxies
// ──────────────────────────────────────────────
// Auth routes → User Service
app.use('/api/auth',  makeProxy(SERVICES.user, { '^/api/auth': '/api/auth' }));

// User management → User Service
app.use('/api/users', makeProxy(SERVICES.user, { '^/api/users': '/api/users' }));

// Courses & enrollments → Course Service
app.use('/api/courses', makeProxy(SERVICES.course, { '^/api/courses': '/api/courses' }));

// Assessments, assignments, quizzes, submissions → Assessment Service
app.use('/api/assessments', makeProxy(SERVICES.assessment, { '^/api/assessments': '/api/assessments' }));

// Notifications → Notification Service
app.use('/api/notifications', makeProxy(SERVICES.notification, { '^/api/notifications': '/api/notifications' }));

// Analytics → Analytics Service
app.use('/api/analytics', makeProxy(SERVICES.analytics, { '^/api/analytics': '/api/analytics' }));

// ──────────────────────────────────────────────
//  Gateway Health
// ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date(),
    services: Object.keys(SERVICES).map((k) => ({ name: k, url: SERVICES[k] })),
  });
});

// ──────────────────────────────────────────────
//  404 & Error Handlers
// ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found on gateway` });
});

app.use((err, req, res, next) => {
  logger.error(`Gateway error: ${err.message}`);
  res.status(500).json({ success: false, message: 'Internal gateway error' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Routing to services: ${JSON.stringify(SERVICES, null, 2)}`);
});

module.exports = app;
