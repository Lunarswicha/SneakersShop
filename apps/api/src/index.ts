import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import csrf from 'csurf';
import { apiRouter } from './routes/index.js';
import { 
  authRateLimit, 
  apiRateLimit, 
  securityHeaders, 
  requestId, 
  securityLogging 
} from './middleware/security.js';

const app = express();

// Enhanced security middleware
app.use(requestId);
app.use(securityHeaders);
app.use(securityLogging);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaultCsp: true,
    directives: {
      "img-src": ["'self'", "data:", "https:"],
      "script-src": ["'self'"],
      "connect-src": ["'self'", process.env.CORS_ORIGIN || ""],
    }
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Apply enhanced rate limiting
app.use('/api', apiRateLimit);

if (process.env.NODE_ENV === 'production') {
  const csrfProtection = csrf({ cookie: true });
  app.use((req, res, next) => {
    if (['POST','PUT','PATCH','DELETE'].includes(req.method)) {
      return csrfProtection(req, res, next);
    }
    next();
  });
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', apiRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
