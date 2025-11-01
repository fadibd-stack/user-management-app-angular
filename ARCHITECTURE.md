# TrakIntel Angular Frontend - Architecture Documentation

**Version:** 2.0.0
**Last Updated:** October 2025

---

## 📐 Architecture Overview

TrakIntel Angular frontend is built using Angular 19's latest standalone component architecture, providing a modern, scalable, and maintainable codebase for enterprise test management.

### Technology Stack

- **Framework:** Angular 19.2.13
- **UI Library:** Angular Material 19.2.19
- **Language:** TypeScript 5.7+
- **State Management:** RxJS 7.8+ (Service-based)
- **HTTP Client:** Angular HttpClient
- **Build Tool:** Angular CLI + esbuild
- **Testing:** Jasmine + Karma
- **Package Manager:** npm

---

## 🏛️ Architectural Patterns

### 1. Standalone Components Architecture

The application uses Angular 19's standalone component model:

```typescript
@Component({
  selector: 'app-test-cases-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    // ... other imports
  ],
  templateUrl: './test-cases-list.component.html'
})
export class TestCasesListComponent implements OnInit {
  // Component logic
}
```

**Benefits:**
- No NgModules required
- Smaller bundle sizes
- Better tree-shaking
- Easier lazy loading
- Simplified dependency management

### 2. Feature-Based Folder Structure

```
features/
├── test-cases/
│   ├── components/
│   │   └── test-cases-list.component.ts
│   ├── services/
│   │   └── test-cases.service.ts
│   └── models/
│       └── test-case.model.ts
```

Each feature is self-contained with:
- **Components** - UI logic and templates
- **Services** - Business logic and API calls
- **Models** - TypeScript interfaces

### 3. Core Module Pattern

```
core/
├── components/     # Layout components
├── guards/         # Route guards
├── interceptors/   # HTTP interceptors
└── services/       # Singleton services
```

Core services are provided at root level:
```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService { }
```

### 4. Reactive Programming with RxJS

All data flows use Observables:

```typescript
// Service
getTestCases(): Observable<TestCase[]> {
  return this.apiService.get<TestCase[]>('/api/test-cases');
}

// Component
testCases$ = this.testCasesService.getTestCases();

// Template
<div *ngFor="let testCase of testCases$ | async">
```

---

## 🔧 Core Services

### ApiService
**Location:** `core/services/api.service.ts`

Centralized HTTP client with:
- Base URL configuration
- Generic type support
- Error handling
- Header management

```typescript
class ApiService {
  get<T>(url: string): Observable<T>
  post<T>(url: string, body: any): Observable<T>
  put<T>(url: string, body: any): Observable<T>
  delete<T>(url: string): Observable<T>
}
```

### AuthService
**Location:** `core/services/auth.service.ts`

Authentication management:
- User login/logout
- Current user storage
- User state as BehaviorSubject
- Session persistence

```typescript
class AuthService {
  currentUserValue: User | null
  currentUser$: Observable<User | null>
  login(credentials): Observable<User>
  logout(): void
}
```

### Feature Services

Each feature has dedicated services:
- `TestCasesService` - Test case CRUD operations
- `TaskPoolService` - Task assignment workflows
- `JiraService` - JIRA integration
- `AuditService` - Audit trail queries
- etc.

---

## 🛡️ Security

### Authentication Guard
**Location:** `core/guards/auth.guard.ts`

Protects authenticated routes:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUserValue) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

### HTTP Authentication

X-User-ID header authentication:

```typescript
headers = headers.set('X-User-ID', userId.toString());
```

**Future:** JWT token-based authentication

---

## 🎨 UI/UX Architecture

### Material Design System

Using Angular Material components:
- **Tables** - MatTable with sorting/pagination
- **Forms** - Reactive forms with Material inputs
- **Navigation** - MatSidenav for responsive menu
- **Dialogs** - MatDialog for modals
- **Cards** - MatCard for content containers

### Layout Structure

```
MainLayoutComponent
├── mat-sidenav (navigation)
│   ├── Logo/Brand
│   ├── Collapsible Sections
│   │   ├── Main
│   │   ├── System Configuration
│   │   ├── Org Code Table
│   │   └── Additional
│   └── Logout
└── mat-sidenav-content
    ├── mat-toolbar (header)
    │   ├── Menu toggle
    │   ├── Page title
    │   └── User info
    └── router-outlet (content)
```

### Permission-Based UI

Menus dynamically adjust based on user permissions:

```typescript
get menuSections(): MenuSection[] {
  const user = this.currentUser;
  const sections = [/* Base sections */];

  if (user?.employment_type === 'intersystems') {
    sections.push(/* System Config */);
  }

  if (user?.is_org_admin || user?.permission_level === 'org_admin') {
    sections.push(/* Org Admin sections */);
  }

  return sections;
}
```

---

## 🚦 Routing Architecture

### Route Configuration

```typescript
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'test-cases', component: TestCasesListComponent },
      { path: 'test-executions', component: TestExecutionsListComponent },
      // ... 25+ feature routes
    ]
  },
  { path: '**', redirectTo: '' }
];
```

### Route Guards

- **authGuard** - Requires authentication
- **Future:** roleGuard, permissionGuard

### Lazy Loading Ready

While currently using standalone components directly, the architecture supports lazy loading:

```typescript
{
  path: 'admin',
  loadComponent: () => import('./features/admin/admin.component')
}
```

---

## 📡 Data Flow

### Service → Component Pattern

```
[API Backend]
     ↓
[Feature Service] ← Observable
     ↓
[Component] ← Subscribe / Async Pipe
     ↓
[Template] ← Data binding
```

### Example Flow

```typescript
// 1. Service makes API call
testCasesService.getTestCases()

// 2. Returns Observable<TestCase[]>
  .subscribe({
    next: (testCases) => {
      // 3. Component receives data
      this.testCases = testCases;
    },
    error: (err) => {
      // 4. Handle errors
      console.error(err);
    }
  });

// 5. Template renders
// <div *ngFor="let tc of testCases">
```

### State Management

**Current:** Service-based state with BehaviorSubjects

```typescript
private testCasesSubject = new BehaviorSubject<TestCase[]>([]);
testCases$ = this.testCasesSubject.asObservable();

loadTestCases() {
  this.api.get<TestCase[]>('/api/test-cases')
    .subscribe(cases => this.testCasesSubject.next(cases));
}
```

**Future Considerations:** NgRx or Signals for complex state

---

## 🔄 Component Lifecycle

### Standard Component Pattern

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Load initial data
    this.loadData();

    // Subscribe to observables
    this.dataService.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.data = data);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    // Fetch data
  }
}
```

### Best Practices

1. **Unsubscribe** - Use `takeUntil` or async pipe
2. **Loading states** - Show spinners during data fetch
3. **Error handling** - Display user-friendly messages
4. **Initialization** - Load data in `ngOnInit`
5. **Cleanup** - Unsubscribe in `ngOnDestroy`

---

## 📦 Module Organization

### Feature Module Structure

```
features/test-cases/
├── components/
│   ├── test-cases-list.component.ts
│   ├── test-cases-list.component.html
│   ├── test-case-form.component.ts
│   └── test-case-detail.component.ts
├── services/
│   ├── test-cases.service.ts
│   └── test-cases.service.spec.ts
├── models/
│   ├── test-case.model.ts
│   ├── test-case-create.model.ts
│   └── test-case-update.model.ts
└── README.md (optional)
```

### Shared Resources

```
shared/
├── components/
│   ├── header/
│   └── sidebar/ (legacy - to be removed)
├── directives/
├── pipes/
└── utils/
```

---

## 🧪 Testing Strategy

### Unit Testing

**Framework:** Jasmine + Karma

```typescript
describe('TestCasesListComponent', () => {
  let component: TestCasesListComponent;
  let fixture: ComponentFixture<TestCasesListComponent>;
  let service: TestCasesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCasesListComponent],
      providers: [
        provideHttpClient(),
        TestCasesService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestCasesListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TestCasesService);
  });

  it('should load test cases on init', () => {
    const mockCases = [/* mock data */];
    spyOn(service, 'getTestCases').and.returnValue(of(mockCases));

    component.ngOnInit();

    expect(component.testCases).toEqual(mockCases);
  });
});
```

### Service Testing

```typescript
describe('TestCasesService', () => {
  let service: TestCasesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TestCasesService]
    });

    service = TestBed.inject(TestCasesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch test cases', () => {
    service.getTestCases().subscribe(cases => {
      expect(cases.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/test-cases');
    expect(req.request.method).toBe('GET');
    req.flush([/* mock data */]);
  });
});
```

---

## 🚀 Performance Optimization

### Current Optimizations

1. **AOT Compilation** - Faster rendering
2. **Tree Shaking** - Remove unused code
3. **Lazy Loading** - Load routes on demand (ready)
4. **OnPush Change Detection** - Reduce checks (future)
5. **TrackBy Functions** - Optimize ngFor

### Bundle Size Management

```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kB",
      "maximumError": "1MB"
    }
  ]
}
```

Current size: ~1.34 MB (needs optimization)

### Future Optimizations

- Lazy load feature modules
- Implement OnPush change detection
- Use Angular Signals for reactive state
- Code splitting for large dependencies
- Image optimization

---

## 🔌 External Integrations

### Backend API
- **URL:** http://localhost:8000
- **Auth:** X-User-ID header
- **Format:** JSON REST API

### Swagger UI Integration
- Embedded at `/api-docs` route
- Uses DomSanitizer for iframe

### JIRA Integration
- Sync issues from JIRA
- Display in dashboard
- Configure connection

### TrakIntel API
- Generate release highlights
- Impact scoring
- AI documentation

---

## 📝 Code Style Guide

### TypeScript

```typescript
// Use explicit types
function getTestCase(id: number): Observable<TestCase> { }

// Use interfaces for models
interface TestCase {
  id: number;
  title: string;
  status: string;
}

// Use readonly for immutability
readonly baseUrl = 'http://localhost:8000';
```

### Component Templates

```html
<!-- Use async pipe -->
<div *ngFor="let item of items$ | async">

<!-- Use track for ngFor -->
<div *ngFor="let item of items; trackBy: trackById">

<!-- Use new control flow (Angular 17+) -->
@if (loading) {
  <mat-spinner></mat-spinner>
} @else {
  <div>{{ data }}</div>
}
```

### Naming Conventions

- **Components:** `feature-name.component.ts`
- **Services:** `feature-name.service.ts`
- **Models:** `model-name.model.ts`
- **Guards:** `guard-name.guard.ts`
- **Classes:** PascalCase
- **Variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE

---

## 🔮 Future Enhancements

### Planned Features

1. **Angular Signals** - Modern reactivity (v16+)
2. **Lazy Loading** - Route-level code splitting
3. **PWA Support** - Offline capability
4. **JWT Authentication** - Token-based auth
5. **NgRx** - Advanced state management
6. **i18n** - Internationalization
7. **Dark Mode** - Theme switching
8. **E2E Tests** - Playwright/Cypress
9. **Performance Monitoring** - Analytics
10. **Accessibility** - WCAG compliance

### Technical Debt

- Remove legacy sidebar component
- Optimize bundle size
- Add comprehensive unit tests
- Implement error boundary
- Add loading skeleton screens

---

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Material Design](https://material.angular.io)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Backend API Docs](http://localhost:8000/docs)

---

**Maintained by:** TrakIntel Development Team
**Last Review:** October 2025
