# Development Guide

## 🛠️ Development Environment Setup

### Prerequisites

- Go 1.21+
- Node.js 20+
- PostgreSQL 14+
- Git
- VS Code (recommended)

### IDE Configuration

#### VS Code Extensions

```json
{
  "recommendations": [
    "angular.ng-template",
    "ionic.ionic",
    "golang.go",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "go.useLanguageServer": true
}
```

## 🏗️ Architecture Overview

### Frontend Architecture

```
src/app/
├── core/                 # Core services and utilities
│   ├── auth.service.ts   # Authentication service
│   ├── time.service.ts   # Time tracking service
│   ├── i18n.service.ts   # Internationalization
│   └── token.interceptor.ts # HTTP interceptor
├── features/             # Feature modules
│   ├── auth/            # Authentication feature
│   └── home/            # Time tracking feature
├── layout/              # Layout components
│   └── main-shell/      # Main application shell
├── state/               # NGXS state management
│   ├── auth.state.ts    # Authentication state
│   └── auth.actions.ts  # Authentication actions
└── shared/              # Shared components and utilities
```

### Backend Architecture

```
backend/
├── actions/             # HTTP handlers
│   ├── auth_actions.go  # Authentication endpoints
│   ├── timetrac_actions.go # Time tracking endpoints
│   └── auth_middleware.go # JWT middleware
├── models/              # Database models
│   ├── user.go         # User model
│   ├── timetrac.go     # Time entry model
│   └── auth_token.go   # JWT token model
├── migrations/          # Database migrations
└── config/             # Configuration files
```

## 🔧 Development Workflow

### Git Branching Strategy

```
main (production)
├── staging (staging environment)
│   └── dev (development)
│       └── feature/feature-name
```

### Commit Convention

```
type(scope): description

feat(auth): add JWT token refresh
fix(ui): resolve mobile navigation issue
docs(readme): update installation guide
test(api): add unit tests for auth endpoints
```

### Development Commands

#### Backend Development

```bash
# Start development server with hot reload
buffalo dev

# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Format code
gofmt -s -w .

# Lint code
golangci-lint run
```

#### Frontend Development

```bash
# Start development server
npm start

# Run tests
npm test

# Run e2e tests
npm run e2e

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## 🧪 Testing Strategy

### Unit Testing

- **Backend**: Go testing package
- **Frontend**: Jasmine/Karma with Angular Testing Utilities

### Integration Testing

- **API Testing**: HTTP endpoint testing
- **Database Testing**: Model and migration testing

### E2E Testing

- **Frontend**: Cypress or Protractor
- **Mobile**: Appium for mobile app testing

### Performance Testing

- **Lighthouse CI**: Automated performance monitoring
- **Load Testing**: API endpoint load testing

## 📱 Mobile Development

### iOS Development

```bash
# Sync iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build iOS app
npx cap build ios
```

### Android Development

```bash
# Sync Android project
npx cap sync android

# Open in Android Studio
npx cap open android

# Build Android app
npx cap build android
```

## 🌍 Internationalization

### Adding New Languages

1. Add language code to `i18n.service.ts`
2. Create translation files in `src/assets/i18n/`
3. Update language switcher component
4. Test RTL support if applicable

### Translation File Structure

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout"
  }
}
```

## 🔒 Security Best Practices

### Authentication

- Use strong JWT secrets
- Implement token refresh
- Validate all inputs
- Use HTTPS in production

### Database Security

- Use parameterized queries
- Implement proper access controls
- Regular security updates
- Backup encryption

### API Security

- Rate limiting
- CORS configuration
- Input validation
- Error handling

## 📊 Performance Optimization

### Frontend Optimization

- Lazy loading modules
- OnPush change detection
- Bundle size optimization
- Image optimization

### Backend Optimization

- Database query optimization
- Caching strategies
- Connection pooling
- Response compression

## 🐛 Debugging

### Frontend Debugging

```bash
# Enable debug mode
ng serve --configuration=development

# Use Angular DevTools
# Install browser extension for Angular DevTools
```

### Backend Debugging

```bash
# Enable debug logging
export LOG_LEVEL=debug
buffalo dev

# Use Delve debugger
dlv debug
```

### Database Debugging

```bash
# Enable query logging
export POP_DEBUG=true
buffalo dev
```

## 📝 Code Style Guidelines

### TypeScript/Angular

- Use strict mode
- Prefer interfaces over types
- Use dependency injection
- Follow Angular style guide

### Go

- Use gofmt for formatting
- Follow Go naming conventions
- Use meaningful variable names
- Add comprehensive comments

### SCSS

- Use CSS custom properties
- Follow BEM methodology
- Use semantic class names
- Optimize for performance

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance tests passed
- [ ] Documentation updated

### Deployment

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy in place

### Post-deployment

- [ ] Health checks passing
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] User acceptance testing
- [ ] Documentation updated

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues

```bash
# Database connection issues
psql -d timetrac -c "SELECT 1;"

# Migration issues
buffalo pop migrate reset

# JWT token issues
export JWT_SECRET="new-secret-key"
```

#### Frontend Issues

```bash
# Node modules issues
rm -rf node_modules package-lock.json
npm install

# Angular build issues
ng build --verbose

# Ionic issues
ionic repair
```

#### Mobile Issues

```bash
# Capacitor sync issues
npx cap sync

# iOS build issues
cd ios && pod install

# Android build issues
npx cap sync android
```

## 📚 Resources

### Documentation

- [Angular Documentation](https://angular.io/docs)
- [Ionic Documentation](https://ionicframework.com/docs)
- [Buffalo Documentation](https://gobuffalo.io/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)

### Tools

- [Angular DevTools](https://angular.io/guide/devtools)
- [Ionic DevApp](https://ionicframework.com/docs/appflow/devapp)
- [Postman](https://www.postman.com/) - API testing
- [DBeaver](https://dbeaver.io/) - Database management

### Learning Resources

- [Angular University](https://angular-university.io/)
- [Ionic Academy](https://ionicacademy.com/)
- [Go by Example](https://gobyexample.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
