# Mindway Frontend v2

Angular 19 web application for Mindway child development platform. Provides family, therapist, educator, and admin interfaces for tracking child development, anamnesis, and clinical reports.

## Quick Start

### 1. Requirements

- Node.js: **20.x** recommended
- npm (included with Node.js)
- Angular CLI (installed via npm)

### 2. Install dependencies

```powershell
cd mindway-frontend-v2
npm ci
```

### 3. Run development server

```powershell
npm start
```

Server runs on `http://localhost:4207` by default.

### 4. Build for production

```powershell
npm run build
```

Output goes to `dist/mindway-frontend-v2/browser/`.

---

## Development Workflow

### Environment Configuration

Set API endpoint in `src/environments/environment.ts` and `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  apiUrl: 'http://localhost:3333/api'
};
```

### Testing

Run unit tests:

```powershell
npm run test
```

Run tests with coverage:

```powershell
npm run test -- --code-coverage
```

### Linting

Check TypeScript and lint issues:

```powershell
npm run lint
```

---

## Architecture

### Key Directories

```text
src/
  app/
    api/
      interfaces/          # Data contracts with backend
      services/            # HTTP service layer
    auth/
      link-clinic/
      link-therapist/
    core/
      interceptors/        # HTTP interceptors (auth, error handling)
    pages/
      child-profile/       # Child development data + milestones
      dashborad/           # Main user dashboard
      reports-child/       # Clinical reports
      anamnesis/           # Anamnesis (family history)
    services/
      auth.service.ts      # Authentication logic
      child.service.ts     # Child management
      latest-update.service.ts  # Fetch latest report/update
  assets/                  # Static files
  environments/            # Environment-specific config
```

### Data Flow

1. **Authentication**: `AuthService` handles login, token storage, and user state
2. **Child Selection**: `ChildService` manages selected child state across app
3. **Dashboard**: Loads children via `ChildService`, latest updates via `LatestUpdateService`
4. **Child Profile**: Displays child data, anamnesis, and reports in real-time
5. **Reports**: `ReportsChildService` fetches and manages clinical observations

All services use RxJS `BehaviorSubject` for reactive state management.

---

## Recent Changes (Latest PR)

### Dashboard & Child Profile Fixes

- **Removed mock data** from child selection dropdown — now loads real children from API
- **Implemented `LatestUpdateService`** to fetch the most recent report dynamically (instead of hardcoded mock)
- **Fixed null-safety** in `child-profile.component.html` for nested properties (`motorDevelopment`, `languageCommunication`)
- **Updated `dashborad.component.ts`** to use real service-based data binding
- **Enhanced `child.service.ts`** with better selection state management
- **TypeScript strict mode**: Updated `tsconfig.json` for null/undefined checks

### Build Status

✅ Angular 19 build passes  
✅ No TypeScript errors  
✅ No hardcoded mock data in production code  

---

## API Integration

The frontend expects the backend API at the URL defined in `environment.ts`. 

### Key Endpoints Used

- `GET /api/users/me` — Current user profile
- `GET /api/children` — List accessible children
- `GET /api/reports-children/child/{childId}` — Child's reports (paginated)
- `GET /api/anamneses/child/{childId}` — Child's anamnesis
- `POST /api/reports-children` — Create new report
- `PUT /api/anamneses/{anamnesisId}` — Update anamnesis

Full API documentation available at `http://localhost:3333/api/openapi.json` (when backend is running).

---

## Troubleshooting

**"Cannot find module @angular/..."**
- Run `npm ci` to install exact dependencies from lock file

**Port 4207 already in use**
- Change in `angular.json` or use:
  ```powershell
  ng serve --port 4208
  ```

**Backend API not responding**
- Ensure backend is running: `npm run dev` in `mindway-api/`
- Check `environment.ts` has correct `apiUrl`
- Verify CORS settings in backend

**Build fails with TypeScript errors**
- Run `npm run lint` to see strict mode violations
- Most common: null/undefined access without safe navigation (`?.`)

---

## Technologies

- **Framework**: Angular 19
- **Language**: TypeScript
- **Styling**: SCSS
- **State**: RxJS (reactive programming)
- **HTTP**: HttpClient
- **Testing**: Karma + Jasmine

---

## Git Branches

- `main` — Production-ready code
- `feature/painel_atualizado` — Latest dashboard and child profile improvements

---

## License

Proprietary — Mindway
