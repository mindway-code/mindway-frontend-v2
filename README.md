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

- The profile page now uses a wider centered content area and a compact account header with the MindWay logo, Panel link, and signed-in user's name and photo.
- The family profile page now presents account metadata beside the user identity and uses compact, clearly bordered child and invitation cards.
- Increased the homepage card illustration sizes across desktop and mobile layouts while preserving their aspect ratio.
- Added the supplied illustrations under `src/assets/img/illustrations/` and integrated them into the “Como funciona”, “Sobre”, and “Contato” pages, including the four step cards and support artwork.
- The public Help page now has a searchable FAQ and a direct contact card; the Contact page uses the split message-form and support-art layout from the latest prototypes.
- The public “Sobre” page now pairs the project introduction with the supplied family-and-care illustration and four value cards: purpose, team, privacy, and values.
- The public “Como funciona” page now uses a compact split hero with the family illustration and a four-step guide, matching the updated prototype.
- The public home page now follows the welcome dashboard design with profile, reports, and panel access cards plus a personalized-support banner. The reports card links to `/reports-child`.
- The registration options page now presents four responsive profile cards: responsible adult, clinic, health professional, and school. Therapist accounts continue through the clinic invitation flow.
- Registration profile cards use concise, action-oriented Portuguese descriptions for each of the four entry profiles.
- The registration profile selection page now uses a smaller logo, more restrained headings, and slightly more compact cards for a more balanced presentation.
- The registration options hero reuses the original homepage `hero.png`, adapted to the lower panel with a soft fade into the welcome text.
- The clinic account screen now uses a responsive split layout with the supplied logo, clinic benefits, and clearer sections for clinic details and password setup.
- Clinic registration now includes an optional CNPJ field and requires the user to check the terms and privacy acknowledgment before submitting. The optional CNPJ is passed to the API.
- The clinic registration panel uses the supplied clinic illustration at `src/assets/img/clinic-registration.png`.
- The clinic registration panel now keeps the illustration in its lower area and uses smaller logo and headings to preserve clear space for the welcome copy.
- The clinic illustration panel now has a white background to blend with the logo asset, with a soft white fade between the welcome copy and the image.
- The professional registration page now uses the supplied clinic illustration from `src/assets/img/clinic-registration.png` in its side panel.
- The profile page now uses a centered content width, clearer card borders, and tighter spacing between the account, children, and access-sharing sections.

### Homepage Visual Assets

- Added the supplied homepage illustrations and logo under `src/assets/img/home/`.
- The public landing page now uses `hero.png`, `responsavel.png`, `escola.png`, `profissional.png`, and `clinica.png`; the shared public navbar uses `logo.png`.
- Profile card captions and arrows are included in the supplied card images, so the page renders each image as a complete card.
- Keep this README and the root system documentation aligned when future changes affect user-facing behavior, assets, navigation, setup, or architecture.
- Adjusted the hero copy/image separation, made the public layout full width, and reinforced shared footer styling to prevent overlap and unstyled footer links.
- Removed the “Horário de atendimento” card from the Help page and changed its remaining contact channels to a two-column grid.
- Reduced the public navbar logo size and expanded the home hero artwork behind a pale gradient so it remains visible without competing with the headline.
- Shifted the hero artwork slightly right and shortened the pale gradient fade to reveal more of the family while keeping the headline readable.
- Reduced the public navbar logo again and moved it slightly down to keep the top of the symbol visible.
- Restored the supplied PNG logo in the public navbar at the previously reduced dimensions.
- The home page “Responsável pela criança” card now opens the responsible account registration form directly at `/register`.
- Removed message shortcuts from the family and professional dashboard home views. The `/messages` route remains available, but it is no longer shown in the sidebar.
- Simplified the dashboard sidebar to show only Início, Anamnese, Crianças, Relatórios, and Configurações.

### Public Site Navigation

- The shared public navbar now displays **Entrar** (`/login`) and **Cadastrar** (`/register-options`) actions in place of the authenticated **Perfil** and **Sair** actions.
- Keep this README updated whenever future project changes add or alter user-facing features, navigation, setup steps, or architecture.

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
