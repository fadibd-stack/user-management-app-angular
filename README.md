# TrakIntel - Test Case Management Platform (Angular)

A modern, enterprise-grade test case management platform built with Angular 19 and Material Design.

## 🎯 Overview

TrakIntel is a comprehensive test management solution designed for software testing teams. This Angular frontend provides an intuitive, responsive interface for managing test cases, tracking executions, collaborating with teams, and generating insights.

**Version:** 2.0.0
**Angular Version:** 19.2.13
**Material Design Version:** 19.2.19
**Last Updated:** October 2025

---

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - Secure login with role-based access control
- ✅ **Dashboard** - Real-time metrics and quick access to key features
- ✅ **Test Case Management** - Create, edit, and organize test cases
- ✅ **Test Execution Tracking** - Monitor test runs with version history
- ✅ **Task Pool** - Collaborative task assignment and workflow management
- ✅ **Team Collaboration** - Discussions, advice Q&A, and comments

### Advanced Features
- ✅ **Release Highlights** - AI-generated release documentation
- ✅ **Workbench** - Impact scoring and prioritization tools
- ✅ **System Areas** - Visual component organization with progress tracking
- ✅ **JIRA Integration** - Sync and manage JIRA issues
- ✅ **TCFT Browser** - Product/Domain/Function hierarchy navigation
- ✅ **Audit Trail** - Complete activity history (admin-only)
- ✅ **Multi-tenancy** - Organization-based data isolation

### UI/UX
- ✅ **Material Design 3** - Modern, accessible interface
- ✅ **Responsive Layout** - Desktop and mobile support
- ✅ **Collapsible Navigation** - Toggleable sidebar with permission-based menus
- ✅ **Real-time Updates** - Dynamic data loading with RxJS
- ✅ **Dark Mode Ready** - Material theme infrastructure in place

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Backend API running on http://localhost:8000

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd user-management-app-angular
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The application will be available at `http://localhost:4200/`

### Default Login Credentials
```
Username: fadibd
Password: 123
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and guards
│   │   ├── components/          # Main layout component
│   │   ├── guards/              # Route guards (auth)
│   │   ├── interceptors/        # HTTP interceptors
│   │   └── services/            # Core services (auth, api)
│   ├── features/                # Feature modules (standalone components)
│   │   ├── advice/              # Advice/Q&A module
│   │   ├── api-docs/            # Swagger UI integration
│   │   ├── audit-trail/         # Audit log viewer
│   │   ├── auth/                # Login component
│   │   ├── code-tables/         # Configurable lookups
│   │   ├── component-tiles/     # System areas dashboard
│   │   ├── countries/           # Country management
│   │   ├── dashboard/           # Home dashboard
│   │   ├── editions/            # Product editions
│   │   ├── environments/        # Environment configs
│   │   ├── functions/           # TCFT browser
│   │   ├── groups/              # Group management
│   │   ├── impact-score-config/ # Scoring configuration
│   │   ├── jira-*/              # JIRA integration modules
│   │   ├── organizations/       # Organization management
│   │   ├── projects/            # Project management
│   │   ├── release-highlights/  # AI documentation
│   │   ├── releases/            # Release management
│   │   ├── task-pool/           # Task assignments
│   │   ├── team-*/              # Team collaboration
│   │   ├── test-cases/          # Test case management
│   │   ├── test-executions/     # Execution tracking
│   │   ├── trakintel-config/    # TrakIntel settings
│   │   ├── users/               # User management
│   │   └── workbench/           # Impact scoring workbench
│   └── shared/                  # Shared components (legacy)
├── styles/                      # Global styles and themes
└── environments/                # Environment configurations
```

---

## 🏗️ Architecture

### Standalone Components
The application uses Angular 19's standalone component architecture:
- No NgModules required
- Direct component imports
- Tree-shakable and optimized bundles

### State Management
- **RxJS Observables** for reactive data flow
- **Service-based state** with shared services
- **Local component state** for UI concerns

### Routing
- **Lazy loading** ready architecture
- **Auth guard** protection on all routes
- **MainLayoutComponent** wrapper for authenticated routes

### API Integration
- **ApiService** - Centralized HTTP client
- **AuthService** - Authentication management
- **X-User-ID header** authentication (migrating to JWT)

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

### Code Scaffolding

Generate new components using Angular CLI:

```bash
# Generate a feature component
ng generate component features/my-feature/components/my-component

# Generate a service
ng generate service features/my-feature/services/my-service

# Generate a model
ng generate interface features/my-feature/models/my-model
```

### Coding Standards

- **TypeScript strict mode** enabled
- **ESLint** for code quality
- **Standalone components** preferred
- **RxJS best practices** (unsubscribe, async pipe)
- **Material Design** guidelines

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```
- Framework: Jasmine + Karma
- Coverage: Component, Service, Guard

### E2E Tests
```bash
npm run e2e
```
(Framework to be configured)

---

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

Output: `dist/user-management-app-angular/`

### Environment Configuration

Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000'
};
```

### Build Optimization
- Ahead-of-Time (AOT) compilation
- Tree shaking
- Minification
- Source maps (dev only)

---

## 🔐 Authentication

The app uses header-based authentication:

1. User logs in via `/login`
2. Backend validates credentials
3. User object stored in `AuthService`
4. `X-User-ID` header sent with all API requests
5. `authGuard` protects authenticated routes

---

## 🎨 Theming

### Material Design Theme
Location: `src/styles.scss`

```scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

### Custom Theming
To create a custom theme, replace the prebuilt theme with Material's theming API:

```scss
@use '@angular/material' as mat;
@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette);
$my-theme: mat.define-light-theme((
  color: (primary: $my-primary)
));

@include mat.all-component-themes($my-theme);
```

---

## 📚 API Documentation

The backend API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Or view it directly in the app at `/api-docs`

---

## 🔗 Related Documentation

- [Backend API Documentation](/backend/API_DOCUMENTATION.md)
- [Audit Trail Guide](/backend/AUDIT_TRAIL_VIEWER_README.md)
- [Seed Data Guide](/backend/SEED_DATA_README.md)
- [TCFT Integration](/backend/TCFT_README.md)

---

## 🐛 Known Issues

- Bundle size warning (cosmetic, not blocking)
- Some Sass deprecation warnings (using `@import`)

---

## 📈 Version History

### v2.0.0 (October 2025) - Angular Migration Complete
- ✅ Complete migration from React to Angular 19
- ✅ 27 feature modules migrated
- ✅ Material Design UI implementation
- ✅ Standalone component architecture
- ✅ Collapsible navigation with permission-based menus

### v1.0.0 (Initial Release)
- React-based implementation

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following coding standards
3. Write/update tests
4. Submit a pull request

---

## 📄 License

[Your License Here]

---

## 👥 Team

**Developed by:** [Your Team Name]
**Contact:** [Contact Information]

---

## 🆘 Support

For issues or questions:
- Check the [API Documentation](http://localhost:8000/docs)
- Review the [Angular CLI Documentation](https://angular.dev/tools/cli)
- Contact the development team

---

**Happy Testing! 🧪✨**
