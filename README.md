# SneakerShop - Complete E-commerce Platform

A modern, full-stack e-commerce application for sneakers built with Next.js, Node.js, PostgreSQL, and enhanced security features.

#Features

###**Authentication & Security**
- **User Registration/Login** with visual feedback
- **JWT Authentication** with secure cookies
- **Password Hashing** using bcrypt (12 salt rounds)
- **Rate Limiting** (5 auth attempts per 15 minutes)
- **Security Headers** (XSS, CSRF, Clickjacking protection)
- **Input Validation** with Zod schemas

### **E-commerce Features**
- **Product Catalog** with 400+ sneaker products
- **Shopping Cart** with real-time updates
- **Checkout Process** with payment simulation
- **Order Management** with order confirmation
- **User Profiles** with dropdown navigation

### **Modern UI/UX**
- **Responsive Design** with Tailwind CSS
- **Success Notifications** for user actions
- **Loading States** and smooth animations
- **Dynamic Navigation** based on auth state
- **Mobile-First** design approach

###  **Development & Deployment**
- **Docker PostgreSQL** database
- **TypeScript** throughout the stack
- **Prisma ORM** for database management
- **Hot Reload** development servers
- **Production Ready** configuration

## Architecture

```
sneakershop/
├── apps/
│   ├── api/                 # Node.js/Express API
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── middleware/  # Security & auth middleware
│   │   │   └── lib/         # Utilities (JWT, hashing)
│   │   └── prisma/          # Database schema & migrations
│   └── frontend/            # Next.js 14 frontend
│       ├── app/             # App Router pages
│       ├── components/      # React components
│       └── contexts/        # React contexts
├── tools/                   # Data scraping & scripts
└── docker-compose.yml       # PostgreSQL database
```

### Prerequisites
- Node.js >= 20
- Docker & Docker Compose
- npm or pnpm

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd sneakershop
```

### 2. Start Database
```bash
docker compose up -d
```

### 3. Setup API
```bash
cd apps/api
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

### 4. Setup Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

### 5. Visit Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000

## 🔧 Environment Variables

### API (.env)
```bash
DATABASE_URL=postgresql://sneakers:sneakers@localhost:5432/sneakershop
JWT_SECRET=your-super-secure-jwt-secret
COOKIE_NAME=sneakershop_jwt
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

## 📊 Database Schema

### Key Models
- **User**: Authentication & profile data
- **Product**: Sneaker catalog with variants
- **ShoppingCart**: User cart items
- **Order**: Purchase history
- **Brand**: Sneaker brands
- **ProductImage**: Product photos

## Security Features

### Password Security
- bcrypt hashing with 12 salt rounds
- Minimum 8 character requirement
- Password confirmation validation

### Authentication
- JWT tokens with 24-hour expiry
- HTTP-only cookies
- Secure cookie flags in production
- Issuer/audience validation

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes
- IP-based limiting with skip successful requests

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy
- Strict-Transport-Security (HTTPS)

##  API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products with pagination
- `GET /api/products/:id` - Get product details

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add/update cart item
- `DELETE /api/cart/:id` - Remove cart item

### Payments
- `POST /api/payments/create` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

##Testing

### Manual Testing
```bash
# Test authentication
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Test products
curl http://localhost:4000/api/products

# Test security headers
curl -I http://localhost:4000/health
```

## User Flow

1. **Browse Products** → View sneaker catalog
2. **Register/Login** → Create account or sign in
3. **Add to Cart** → Add items to shopping cart
4. **Checkout** → Proceed to payment
5. **Order Confirmation** → Complete purchase

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### API (Railway/Render)
1. Connect GitHub repository
2. Set environment variables
3. Add PostgreSQL database
4. Deploy

### Database
- Use managed PostgreSQL (Railway, Supabase, etc.)
- Update DATABASE_URL in production

## 📈 Performance

- **Frontend**: Next.js 14 with App Router
- **API**: Express with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: HTTP caching headers
- **Images**: Optimized with Next.js Image component

## 🔒 Security Checklist

- [x] Password hashing with bcrypt
- [x] JWT authentication
- [x] Rate limiting
- [x] Security headers
- [x] Input validation
- [x] CORS configuration
- [x] HTTPS enforcement
- [x] SQL injection prevention (Prisma)

## 📝 License

MIT License - see LICENSE file for details

 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

