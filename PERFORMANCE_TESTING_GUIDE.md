# Performance Testing Guide

## Overview
This guide provides comprehensive instructions for testing and optimizing the performance of your Angular application.

## Current Performance Status

### Build Analysis Results (Latest)
```
Initial Bundles:
- main.js:        1.21 MB (198.84 kB compressed) ✅
- chunk.js:       164.04 kB (48.56 kB compressed) ✅
- styles.css:     95.91 kB (8.53 kB compressed) ✅
- polyfills.js:   34.58 kB (11.32 kB compressed) ✅

Total Initial:    1.51 MB (267.25 kB compressed) ⚠️

Lazy Chunks:
- browser.js:     67.59 kB (17.71 kB compressed) ✅

Issues Found:
❌ main-layout.component.ts styles: 18.43 kB (exceeds 8 kB budget by 10.43 kB)
```

---

## 1. Quick Performance Tests (Browser-Based)

### A. Chrome Lighthouse Audit (Recommended - 2 minutes)
**Best for:** Overall performance score, accessibility, SEO, best practices

**Steps:**
1. Open your app: `http://localhost:4200`
2. Open Chrome DevTools (F12 or Cmd+Option+I)
3. Click "Lighthouse" tab
4. Select categories:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. Choose "Desktop" or "Mobile"
6. Click "Analyze page load"

**What to look for:**
- **Performance Score:** Aim for 90+
- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.8s
- **Total Blocking Time (TBT):** < 300ms
- **Cumulative Layout Shift (CLS):** < 0.1

### B. Chrome DevTools Performance Profiler
**Best for:** Identifying slow operations, memory leaks, frame drops

**Steps:**
1. Open Chrome DevTools → Performance tab
2. Click Record button (●)
3. Perform actions in your app (navigate, open modals, etc.)
4. Stop recording
5. Analyze the flame chart

**What to look for:**
- Long tasks (> 50ms)
- Frame drops (< 60 FPS)
- Memory leaks (increasing heap size)
- Excessive change detection cycles

### C. Network Tab Analysis
**Best for:** Identifying large resources, slow requests

**Steps:**
1. Open Chrome DevTools → Network tab
2. Reload the page
3. Sort by Size (descending)

**What to look for:**
- Resources > 100 kB
- Requests taking > 1s
- Too many requests (> 50)
- Missing compression

---

## 2. Bundle Analysis

### View Bundle Composition
```bash
# Build with stats
npm run build -- --stats-json

# Install bundle analyzer globally (one time)
npm install -g webpack-bundle-analyzer

# Analyze the bundle
npx webpack-bundle-analyzer dist/user-management-app-angular/stats.json
```

This opens a visual treemap showing:
- What's taking up space in your bundle
- Duplicate dependencies
- Opportunities for code splitting

---

## 3. Runtime Performance Monitoring

### Angular DevTools Extension
**Best for:** Profiling component rendering and change detection

**Installation:**
1. Install from Chrome Web Store: https://chrome.google.com/webstore/detail/angular-devtools/
2. Restart browser
3. Open DevTools → Angular tab

**Features:**
- Component tree inspection
- Change detection profiler
- Injector tree visualization
- Performance profiling

### Memory Profiler
**Best for:** Detecting memory leaks

**Steps:**
1. DevTools → Memory tab
2. Take heap snapshot
3. Use the app for 2-3 minutes
4. Take another snapshot
5. Compare snapshots

**What to look for:**
- Detached DOM nodes
- Growing arrays/objects
- Event listeners not cleaned up

---

## 4. Performance Optimizations

### Critical Issue: Large Component Styles

**Problem:** main-layout.component.ts has 18.43 kB of inline styles (exceeds 8 kB budget)

**Solution:** Extract styles to external SCSS file

```typescript
// BEFORE (current - bad):
@Component({
  selector: 'app-main-layout',
  styles: [`
    /* 1000+ lines of CSS */
  `]
})

// AFTER (recommended):
@Component({
  selector: 'app-main-layout',
  styleUrls: ['./main-layout.component.scss']
})
```

**Implementation Steps:**
1. Create file: `src/app/core/components/main-layout.component.scss`
2. Move all styles from `styles: [\`...\`]` to the new file
3. Update component decorator to use `styleUrls` instead of `styles`
4. Remove the `styles:` array from component

**Expected Improvement:**
- Component size: 18.43 kB → ~2 kB
- Build time: Faster
- Development: Hot reload only styles (not entire component)

### Other Optimizations

#### 1. Enable Production Mode
```typescript
// Already enabled in production builds
if (environment.production) {
  enableProdMode();
}
```

#### 2. Lazy Loading (Already Implemented ✅)
Your app already uses lazy loading (67.59 kB lazy chunk).

#### 3. OnPush Change Detection
For components that don't need frequent updates:

```typescript
@Component({
  selector: 'app-my-component',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

#### 4. Track By Functions
For *ngFor loops:

```typescript
// Template
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

// Or with function
trackById(index: number, item: any): number {
  return item.id;
}
```

#### 5. Unsubscribe from Observables
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## 5. Automated Performance Testing

### Setup Lighthouse CI
```bash
# Install
npm install -g @lhci/cli

# Run
lhci autorun --config=lighthouserc.json
```

### Example lighthouserc.json:
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4200"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

---

## 6. Performance Budgets

### Configure in angular.json:
```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "4kb",
      "maximumError": "8kb"
    }
  ]
}
```

---

## 7. Backend Performance Testing

### Test API Response Times
```bash
# Install Apache Bench (macOS)
brew install httpd

# Test endpoint
ab -n 1000 -c 10 http://localhost:8000/api/users

# What to look for:
# - Mean response time < 100ms
# - No failed requests
# - Consistent response times
```

### Python Profiling
```bash
# Install cProfile
pip install line_profiler

# Profile a function
python -m cProfile -o profile.stats main.py

# View results
python -c "import pstats; p = pstats.Stats('profile.stats'); p.sort_stats('cumulative'); p.print_stats(20)"
```

---

## 8. Performance Checklist

### Before Production Release:

- [ ] Run Lighthouse audit (score > 90)
- [ ] Check bundle size < 500 kB compressed
- [ ] Extract large component styles to external files
- [ ] Enable production build optimizations
- [ ] Test on slow 3G network
- [ ] Test on mobile devices
- [ ] Profile memory usage (no leaks)
- [ ] Check API response times < 100ms
- [ ] Implement lazy loading for routes
- [ ] Use OnPush change detection where possible
- [ ] Optimize images (use WebP, lazy load)
- [ ] Enable gzip/brotli compression on server
- [ ] Configure caching headers

---

## 9. Monitoring in Production

### Frontend Monitoring (Optional)
- **Google Analytics**: User behavior, page load times
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and performance

### Backend Monitoring
- **Prometheus + Grafana**: Metrics dashboards
- **ELK Stack**: Log aggregation and analysis
- **New Relic**: APM (Application Performance Monitoring)

---

## Quick Wins (Start Here)

1. **Fix large component styles** (18.43 kB → 2 kB)
   - Move main-layout.component.ts styles to .scss file
   - Expected: Build time improvement, smaller bundle

2. **Run Lighthouse** (2 minutes)
   - Get baseline performance score
   - Identify low-hanging fruit

3. **Enable compression** on server
   - Add gzip middleware to FastAPI
   - 40-60% size reduction

4. **Lazy load images**
   - Use `loading="lazy"` attribute
   - Faster initial page load

---

## Resources

- [Angular Performance Guide](https://angular.io/guide/performance-best-practices)
- [Web.dev Performance](https://web.dev/performance/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)

---

## Performance Targets

### Good Performance:
- Lighthouse Score: 90+
- Bundle Size: < 500 kB compressed
- FCP: < 1.8s
- LCP: < 2.5s
- TTI: < 3.8s

### Current Status:
- Bundle Size: 267 kB compressed ✅
- Component Styles: 18.43 kB ❌ (needs fix)
- Lazy Loading: Enabled ✅

---

Last Updated: November 2025
