# TimeTrac - Modern Time Tracking Application

<div align="center">

![TimeTrac Logo](timetrac-frontend/src/assets/icon/icon.svg)

**A full-stack time tracking application with modern UI, cross-platform support, and professional CI/CD pipeline**

[![CI/CD](https://github.com/Abudi7/buffalo_angular/actions/workflows/ci-dev.yml/badge.svg)](https://github.com/Abudi7/buffalo_angular/actions/workflows/ci-dev.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-17+-red.svg)](https://angular.io/)
[![Ionic](https://img.shields.io/badge/Ionic-7+-blue.svg)](https://ionicframework.com/)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8.svg)](https://golang.org/)

</div>

## 🚀 Features

### ✨ Core Functionality

- **Time Tracking**: Start/stop timers with project categorization
- **Location Tracking**: Automatic GPS location capture for time entries
- **Photo Attachments**: Camera integration for visual time entry notes
- **Export Functionality**: CSV export with user-friendly data
- **Interactive Maps**: Visual location display for time entries

### 🎨 Modern UI/UX

- **Glass Morphism Design**: Beautiful modern interface with floating elements
- **Responsive Design**: Works seamlessly on web, mobile, and tablet
- **Dark/Light Theme**: Adaptive theming with smooth transitions
- **Hamburger Navigation**: Intuitive sidebar navigation with hover effects
- **Animated Components**: Smooth animations and micro-interactions

### 🌍 Internationalization

- **Multi-language Support**: Arabic (AR), English (EN), German (DE)
- **RTL Support**: Right-to-left layout for Arabic
- **Language Switcher**: Easy language switching in the header

### 📱 Cross-Platform

- **Web Application**: Progressive Web App (PWA) capabilities
- **iOS App**: Native iOS app with Capacitor
- **Mobile Responsive**: Optimized for all screen sizes

### 🔒 Security & Authentication

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Comprehensive server-side validation

### 🏗️ Professional Development

- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Git Branching Strategy**: Professional dev → staging → prod workflow
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Performance Monitoring**: Lighthouse CI integration
- **Security Scanning**: Automated vulnerability detection

## 🏗️ Architecture

### Frontend Stack

- **Angular 17+**: Modern standalone components architecture
- **Ionic 7+**: Cross-platform UI framework
- **NGXS**: State management
- **TypeScript**: Type-safe development
- **SCSS**: Advanced styling with CSS variables
- **Capacitor**: Native mobile app development

### Backend Stack

- **Go 1.21+**: High-performance backend language
- **Buffalo**: Web framework and tooling
- **Pop**: Database ORM and migrations
- **PostgreSQL**: Robust relational database
- **JWT**: Secure authentication tokens

### DevOps & Infrastructure

- **GitHub Actions**: CI/CD automation
- **Docker**: Containerization support
- **Lighthouse CI**: Performance monitoring
- **Trivy**: Security vulnerability scanning
- **Branch Protection**: Professional Git workflow

## 📁 Project Structure

```
TimeTrac/
├── 📁 backend/                    # Go Buffalo backend
│   ├── 📁 actions/               # HTTP handlers and routes
│   │   ├── auth_actions.go       # Authentication endpoints
│   │   ├── timetrac_actions.go   # Time tracking endpoints
│   │   └── auth_middleware.go    # JWT middleware
│   ├── 📁 models/                # Database models
│   │   ├── user.go              # User model
│   │   ├── timetrac.go          # Time entry model
│   │   └── auth_token.go        # JWT token model
│   ├── 📁 migrations/            # Database migrations
│   └── 📄 database.yml           # Database configuration
├── 📁 timetrac-frontend/         # Angular Ionic frontend
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 core/          # Core services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── time.service.ts
│   │   │   │   └── i18n.service.ts
│   │   │   ├── 📁 features/      # Feature modules
│   │   │   │   ├── 📁 auth/      # Authentication
│   │   │   │   └── 📁 home/      # Time tracking
│   │   │   ├── 📁 layout/        # Layout components
│   │   │   └── 📁 state/         # NGXS state management
│   │   ├── 📁 assets/            # Static assets
│   │   └── 📁 environments/      # Environment configs
│   ├── 📁 ios/                   # iOS app configuration
│   └── 📄 lighthouserc.json      # Performance testing config
├── 📁 .github/                   # GitHub Actions workflows
│   └── 📁 workflows/
│       ├── ci-dev.yml           # Development CI
│       ├── ci-staging.yml       # Staging CI
│       └── ci-prod.yml          # Production CI
├── 📁 docs/                      # Documentation
└── 📄 docker-compose.yml         # Docker configuration
```

## 🚀 Quick Start

### Prerequisites

- **Go 1.21+** - [Download](https://golang.org/dl/)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Buffalo CLI** - [Installation Guide](https://gobuffalo.io/en/docs/getting-started/installation)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Abudi7/buffalo_angular.git
   cd buffalo_angular
   ```

2. **Setup Database**

   ```bash
   # Create database
   createdb timetrac

   # Create user and grant permissions
   psql -d timetrac -c "CREATE USER app WITH PASSWORD 'apppass';"
   psql -d timetrac -c "GRANT ALL PRIVILEGES ON DATABASE timetrac TO app;"
   psql -d timetrac -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
   ```

3. **Backend Setup**

   ```bash
   cd backend

   # Install dependencies
   go mod tidy

   # Run migrations
   GO_ENV=development buffalo pop migrate up

   # Set environment variables
   export JWT_SECRET="your-secret-key-here"

   # Start backend server
   buffalo dev
   ```

4. **Frontend Setup**

   ```bash
   cd timetrac-frontend

   # Install dependencies
   npm install

   # Start development server
   npm start
   ```

5. **Access the Application**
   - **Web**: http://localhost:4200
   - **Backend API**: http://localhost:8087
   - **API Documentation**: http://localhost:8087/api/docs

## 📱 Mobile App Setup

### iOS Development

1. **Install iOS Dependencies**

   ```bash
   cd timetrac-frontend
   npm install
   npx cap sync ios
   ```

2. **Open in Xcode**

   ```bash
   npx cap open ios
   ```

3. **Build and Run**
   - Open the project in Xcode
   - Select your target device or simulator
   - Build and run the project

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```bash
JWT_SECRET=your-jwt-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timetrac
DB_USER=app
DB_PASSWORD=apppass
```

#### Frontend (environment files)

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  API_BASE: "http://localhost:8087",
};
```

### Database Configuration

Update `backend/database.yml`:

```yaml
development:
  dialect: "postgres"
  database: "timetrac"
  user: "app"
  password: "apppass"
  host: "127.0.0.1"
  port: "5432"
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
go test ./...
```

### Frontend Tests

```bash
cd timetrac-frontend
npm test
```

### E2E Tests

```bash
cd timetrac-frontend
npm run e2e
```

### Performance Tests

```bash
cd timetrac-frontend
npm run build
npx lhci autorun
```

## 🚀 Deployment

### Development

```bash
# Backend
cd backend && buffalo dev

# Frontend
cd timetrac-frontend && npm start
```

### Staging

```bash
# Build for staging
cd timetrac-frontend
npm run build -- --configuration=staging
```

### Production

```bash
# Build for production
cd timetrac-frontend
npm run build -- --configuration=production
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🔄 CI/CD Pipeline

### Branch Strategy

- **`dev`**: Development branch with feature integration
- **`staging`**: Staging environment for testing
- **`prod`**: Production-ready releases

### Automated Workflows

- **Development CI**: Linting, testing, building
- **Staging CI**: Full testing, performance monitoring
- **Production CI**: Security scanning, deployment, release creation

### Manual Deployment

```bash
# Merge dev to staging
git checkout staging
git merge dev
git push origin staging

# Merge staging to prod
git checkout prod
git merge staging
git push origin prod
```

## 📊 Performance Monitoring

### Lighthouse CI Integration

- **Performance Score**: Monitored on each deployment
- **Accessibility**: WCAG compliance checking
- **SEO**: Search engine optimization metrics
- **PWA**: Progressive Web App capabilities

### Performance Budgets

- **Performance**: 50% minimum
- **Accessibility**: 80% minimum
- **Best Practices**: 70% minimum
- **SEO**: 70% minimum
- **PWA**: 30% minimum

## 🔒 Security

### Authentication

- JWT-based authentication
- Secure password hashing with bcrypt
- Token expiration and refresh

### API Security

- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Security Scanning

- Automated vulnerability scanning with Trivy
- Dependency audit with npm audit
- Go module security with Nancy

## 🌍 Internationalization

### Supported Languages

- **English (EN)**: Default language
- **Arabic (AR)**: RTL support
- **German (DE)**: European localization

### Adding New Languages

1. Add language code to `i18n.service.ts`
2. Create translation files
3. Update language switcher component

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Time Tracking Endpoints

- `POST /api/timetrac/start` - Start time tracking
- `POST /api/timetrac/stop` - Stop time tracking
- `GET /api/timetrac/entries` - Get time entries
- `GET /api/timetrac/export` - Export time data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Angular style guide
- Write comprehensive tests
- Update documentation
- Follow conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Angular](https://angular.io/) - Frontend framework
- [Ionic](https://ionicframework.com/) - Mobile UI framework
- [Buffalo](https://gobuffalo.io/) - Go web framework
- [Capacitor](https://capacitorjs.com/) - Native app development

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Abudi7/buffalo_angular/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Abudi7/buffalo_angular/discussions)
- **Documentation**: [Wiki](https://github.com/Abudi7/buffalo_angular/wiki)

---

<div align="center">

**Made with ❤️ by the TimeTrac Team**

[⭐ Star this repo](https://github.com/Abudi7/buffalo_angular) | [🐛 Report Bug](https://github.com/Abudi7/buffalo_angular/issues) | [💡 Request Feature](https://github.com/Abudi7/buffalo_angular/issues)

</div>
