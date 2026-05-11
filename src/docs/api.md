# API Contract — frontendV2 Agent Guide

## Purpose

This file documents the backend API contract that the Angular frontend must follow.

Use this document when creating or refactoring:

- Angular services
- API interfaces
- Auth flow
- Guards
- Interceptors
- Observable-based state services
- Feature pages that consume backend data

## Base URL

Routes are mounted at:

```txt
/
```

There is currently no `/v1` prefix.

Recommended frontend environment value:

```ts
export const environment = {
  production: false,
  apiUrl: '/api',
};
```

If the backend is proxied through Angular, frontend services should call:

```txt
/api/auth/login
/api/users/me
/api/tasks
```

The Angular proxy should forward `/api` to the backend server.

## Standard Success Response

All successful API responses should be treated as:

```ts
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: PaginationMeta;
  };
}
```

Pagination metadata:

```ts
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

Example response:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## Standard Error Response

All API errors should be treated as:

```ts
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

Example response:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing token.",
    "details": null
  }
}
```

## Auth Rules

Most protected routes require:

```txt
Authorization: Bearer <accessToken>
```

The refresh token is stored in an HttpOnly cookie.

Cookie name:

```txt
refresh_token
```

Or the backend value from:

```txt
env.COOKIE_NAME
```

## Frontend Auth Flow

Recommended Angular flow:

1. User logs in with email and password.
2. API returns an `accessToken`.
3. API also sets the refresh token as an HttpOnly cookie.
4. Frontend stores access token in memory or a controlled auth service.
5. Interceptor adds the access token to protected requests.
6. If access token expires, frontend calls `/auth/refresh`.
7. Refresh endpoint rotates the refresh cookie and returns a new access token.
8. Logout clears frontend state and calls `/auth/logout`.

## Recommended API Interfaces

Create these files:

```txt
src/app/api/interfaces/api-response.interface.ts
src/app/api/interfaces/auth.interface.ts
src/app/api/interfaces/user.interface.ts
src/app/api/interfaces/family.interface.ts
src/app/api/interfaces/family-member.interface.ts
src/app/api/interfaces/task.interface.ts
src/app/api/interfaces/appointment.interface.ts
src/app/api/interfaces/social-network.interface.ts
src/app/api/interfaces/social-network-user.interface.ts
src/app/api/interfaces/message.interface.ts
```

## Shared API Types

```ts
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface DeleteResult {
  id: string;
}
```

---

# Health

## GET `/health`

Returns API health status.

Auth:

```txt
Public
```

Response:

```ts
SuccessResponse<{}>
```

---

# Auth

Base module:

```txt
/api/src/api/v1/modules/auth
```

## POST `/auth/register`

Registers a new user.

Auth:

```txt
Public
```

Body:

```ts
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  provider?: string;
  googleId?: string;
}
```

Response:

```ts
SuccessResponse<{
  accessToken: string;
}>
```

Side effect:

```txt
Sets refresh cookie.
```

## POST `/auth/login`

Logs in a user.

Auth:

```txt
Public
```

Body:

```ts
export interface LoginPayload {
  email: string;
  password: string;
}
```

Response:

```ts
SuccessResponse<{
  accessToken: string;
}>
```

Side effect:

```txt
Sets refresh cookie.
```

## POST `/auth/refresh`

Refreshes the access token.

Auth:

```txt
Uses refresh cookie
```

Body:

```txt
None
```

Response:

```ts
SuccessResponse<{
  accessToken: string;
}>
```

Side effect:

```txt
Rotates refresh cookie.
```

## POST `/auth/logout`

Logs out the user.

Auth:

```txt
Uses refresh cookie
```

Body:

```txt
None
```

Response:

```ts
SuccessResponse<{}>
```

Side effect:

```txt
Clears refresh cookie.
```

## GET `/auth`

Ping endpoint.

Response:

```ts
SuccessResponse<{}>
```

---

# Users

Base module:

```txt
/api/src/api/v1/modules/users
```

Most routes are protected. Some routes are admin-only.

## User Types

```ts
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  provider?: string | null;
  googleId?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

```ts
export interface UserDTO {
  name: string;
  email: string;
  password?: string;
  role?: string;
  provider?: string;
  googleId?: string;
  isActive?: boolean;
}
```

```ts
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}
```

## GET `/users`

Lists users.

Auth:

```txt
Admin only
```

Query:

```ts
export interface ListUsersQuery {
  page?: number;
  pageSize?: number;
}
```

Response:

```ts
SuccessResponse<UserRecord[]>
```

With:

```ts
meta.pagination
```

## POST `/users`

Creates a user.

Auth:

```txt
Admin only
```

Body:

```ts
UserDTO
```

Response:

```ts
SuccessResponse<UserRecord>
```

## GET `/users/me`

Returns the authenticated user.

Auth:

```txt
Authenticated
```

Response:

```ts
SuccessResponse<UserRecord>
```

## PATCH `/users/me`

Updates the authenticated user.

Auth:

```txt
Authenticated
```

Body:

```ts
UpdateUserDTO
```

Response:

```ts
SuccessResponse<UserRecord>
```

## DELETE `/users/me`

Deletes the authenticated user.

Auth:

```txt
Authenticated
```

Response:

```ts
SuccessResponse<{
  id: string;
}>
```

---

# Children

Base module:

```txt
/api/src/api/v1/modules/children
```

## Child Types

```ts
export interface ChildRecord {
  id: string;
  responsibleId: string;
  secondaryResponsibleId?: string | null;
  name: string;
  age: number;
  birthDate: string;
  observation?: string | null;
  accessCode: string;
  createdAt: string;
  updatedAt: string;
}
```

```ts
export interface CreateChildDTO {
  // Admin-only (optional): when provided, creates the child for that responsible user.
  // For normal profile flow, do not send this field (backend derives from auth user).
  responsibleId?: string;
  name: string;
  age: number;
  birthDate: string;
  observation?: string | null;
  secondaryResponsibleId?: string | null;
}
```

## GET `/children`

Lists children visible to the authenticated user.

- For role `common`: returns children where the user is the responsible or secondary responsible.
- For role `admin`: returns all children.

Auth:

```txt
Authenticated
```

Query:

```ts
export interface ListChildrenQuery {
  page?: number;
  pageSize?: number;
}
```

Response:

```ts
SuccessResponse<ChildRecord[]>
```

With:

```ts
meta.pagination
```

## POST `/children`

Creates a child.

Auth:

```txt
Authenticated
```

Body:

```ts
CreateChildDTO
```

Important:

- Frontend must not ask the user to type `responsibleId` or `accessCode`.
- Backend derives `responsibleId` from the authenticated user (`req.user.id`) for normal users.
- Admins may optionally provide `responsibleId` to create for another user; if omitted, it defaults to the authenticated admin.
- Backend generates `accessCode`.

Response:

```ts
SuccessResponse<ChildRecord>
```

---

# Families

Base module:

```txt
/api/src/api/v1/modules/families
```

Auth rules:

```txt
/families = admin only
/families/me = any authenticated user
```

## Family Types

```ts
export interface FamilyRecord {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
```

```ts
export interface CreateFamilyDTO {
  name: string;
}
```

```ts
export interface UpdateFamilyDTO {
  name?: string;
}
```

## GET `/families/me`

Lists families related to the authenticated user.

Auth:

```txt
Authenticated
```

Query:

```ts
PaginationQuery
```

Response:

```ts
SuccessResponse<FamilyRecord[]>
```

With:

```ts
meta.pagination
```

## GET `/families`

Lists all families.

Auth:

```txt
Admin only
```

Query:

```ts
PaginationQuery
```

Response:

```ts
SuccessResponse<FamilyRecord[]>
```

With:

```ts
meta.pagination
```

## POST `/families`

Creates a family.

Auth:

```txt
Admin only
```

Body:

```ts
CreateFamilyDTO
```

Response:

```ts
SuccessResponse<FamilyRecord>
```

## PUT `/families/me`

Updates family data.

Auth:

```txt
Authenticated
```

Body:

```ts
UpdateFamilyDTO
```

Response:

```ts
SuccessResponse<FamilyRecord>
```

### Backend Issue

This route appears broken right now.

The route is:

```txt
PUT /families/me
```

But the controller/service expects:

```txt
req.params.id
```

There is no `:id` route param in `/families/me`.

The backend should probably change this to one of these options:

```txt
PUT /families/:id
```

Or update the controller to infer the family from the authenticated user.

## DELETE `/families/me`

Deletes family data.

Auth:

```txt
Authenticated
```

Response:

```ts
SuccessResponse<{
  id: string;
}>
```

### Backend Issue

This route appears broken right now for the same reason as `PUT /families/me`.

The route has no `:id`, but the controller/service expects `req.params.id`.

---

# Family Members

Base module:

```txt
/api/src/api/v1/modules/familyMembers
```

## Types

```ts
export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}
```

```ts
export interface CreateFamilyMemberDTO {
  userId: string;
  familyId: string;
  role: string;
}
```

```ts
export interface UpdateFamilyMemberDTO {
  role?: string;
}
```

## GET `/family-members`

Lists family members.

Auth:

```txt
Admin only
```

Query:

```ts
export interface ListFamilyMembersQuery {
  page?: number;
  pageSize?: number;
  familyId?: string;
  userId?: string;
}
```

Response:

```ts
SuccessResponse<FamilyMember[]>
```

With:

```ts
meta.pagination
```

## POST `/family-members`

Creates a family member.

Auth:

```txt
Admin only
```

Body:

```ts
CreateFamilyMemberDTO
```

Response:

```ts
SuccessResponse<FamilyMember>
```

## GET `/family-members/:id`

Gets a family member by ID.

Auth:

```txt
Authenticated
```

Response:

```ts
SuccessResponse<FamilyMember>
```

## PUT `/family-members/:id`

Updates a family member.

Auth:

```txt
Authenticated
```

Body:

```ts
UpdateFamilyMemberDTO
```

Response:

```ts
SuccessResponse<FamilyMember>
```

## DELETE `/family-members/:id`

Deletes a family member.

Auth:

```txt
Authenticated
```

Response:

```ts
SuccessResponse<{
  id: string;
}>
```

---

# Tasks

Base module:

```txt
/api/src/api/v1/modules/tasks
```

## Types

```ts
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'canceled';
```

```ts
export interface TaskRecord {
  id: string;
  therapistId: string;
  userId: string;
  title: string;
  status: TaskStatus;
  description?: string | null;
  feedback?: string | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

```ts
export interface CreateTaskDTO {
  therapistId: string;
  userId: string;
  title: string;
  status?: TaskStatus;
  description?: string;
  feedback?: string;
  note?: string;
}
```

```ts
export interface UpdateTaskDTO {
  therapistId?: string;
  userId?: string;
  title?: string;
  status?: TaskStatus;
  description?: string;
  feedback?: string;
  note?: string;
}
```

## GET `/tasks`

Lists tasks.

Auth:

```txt
Admin only
```

Query:

```ts
export interface ListTasksQuery {
  page?: number;
  pageSize?: number;
  status?: TaskStatus;
}
```

Response:

```ts
SuccessResponse<TaskRecord[]>
```

With:

```ts
meta.pagination
```

## GET `/tasks/therapist`

Lists therapist tasks.

Auth:

```txt
Admin only
```

Query:

```ts
ListTasksQuery
```

Response:

```ts
SuccessResponse<TaskRecord[]>
```

With:

```ts
meta.pagination
```

## POST `/tasks`

Creates a task.

Auth:

```txt
Admin only
```

Body:

```ts
CreateTaskDTO
```

Response:

```ts
SuccessResponse<TaskRecord>
```

## PUT `/tasks/:id`

Updates a task.

Auth:

```txt
Authenticated
```

Body:

```ts
UpdateTaskDTO
```

Response:

```ts
SuccessResponse<TaskRecord>
```

## DELETE `/tasks/:id`

Deletes a task.

Auth:

```txt
Authenticated
```

Response:

```ts
SuccessResponse<{
  id: string;
}>
```

---

# Appointments

Base module:

```txt
/api/src/api/v1/modules/appointments
```

## Types

```ts
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'canceled'
  | 'no_show';
```

```ts
export interface AppointmentRecord {
  id: string;
  therapistId?: string | null;
  userId?: string | null;
  status: AppointmentStatus;
  title?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  note?: string | null;
  feedback?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

```ts
export interface CreateAppointmentDTO {
  therapistId?: string;
  userId?: string;
  status?: AppointmentStatus;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  note?: string;
  feedback?: string;
}
```

```ts
export interface UpdateAppointmentDTO {
  therapistId?: string;
  userId?: string;
  status?: AppointmentStatus;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  note?: string;
  feedback?: string;
}
```

## GET `/appointments`

Lists appointments.

Auth:

```txt
Admin only
```

Query:

```ts
export interface ListAppointmentsQuery {
  page?: number;
  pageSize?: number;
  status?: AppointmentStatus;
}
```

Response:

```ts
SuccessResponse<AppointmentRecord[]>
```

With:

```ts
meta.pagination
```

## GET `/appointments/therapist`

Lists therapist appointments.

Auth:

```txt
Admin only
```

Query:

```ts
ListAppointmentsQuery
```

Response:

```ts
SuccessResponse<AppointmentRecord[]>
```

With:

```ts
meta.pagination
```

## POST `/appointments`

Creates an appointment.

Auth:

```txt
Admin only
```

Body:

```ts
CreateAppointmentDTO
```

Response:

```ts
SuccessResponse<AppointmentRecord>
```

## PUT `/appointments/:id`

Updates an appointment.

Auth:

```txt
Authenticated
```

Body:

```ts
UpdateAppointmentDTO
```

Response:

```ts
SuccessResponse<AppointmentRecord>
```

## DELETE `/appointments/:id`

Deletes an appointment.

Auth:

```txt
Authenticated
```

Response:

```ts
SuccessResponse<{
  id: string;
}>
```

---

# Social Networks

Base module:

```txt
/api/src/api/v1/modules/socialNetworks
```

All routes require:

```txt
authMiddleware + authTherapistmiddleware
```

## Important Backend Issue

`authTherapistmiddleware` currently appears to allow admin and every role except therapist.

Current behavior appears to be:

```txt
user.role !== "therapist"
```

That means therapists are blocked.

Expected behavior is probably one of these:

```txt
Allow therapist only
```

Or:

```txt
Allow therapist and admin
```

The frontend should not assume therapist access works correctly until the backend middleware is fixed.

## Types

```ts
export interface SocialNetworkRecord {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

```ts
export interface CreateSocialNetworkDTO {
  name: string;
  description?: string;
}
```

```ts
export interface UpdateSocialNetworkDTO {
  name?: string;
  description?: string;
}
```

## GET `/social-networks`

Lists social networks.

Auth:

```txt
Authenticated + authTherapistmiddleware
```

Response:

```ts
SuccessResponse<SocialNetworkRecord[]>
```

## POST `/social-networks`

Creates a social network.

Auth:

```txt
Authenticated + authTherapistmiddleware
```

Body:

```ts
CreateSocialNetworkDTO
```

Response:

```ts
SuccessResponse<SocialNetworkRecord>
```

## PUT `/social-networks/:id`

Updates a social network.

Auth:

```txt
Authenticated + authTherapistmiddleware
```

Body:

```ts
UpdateSocialNetworkDTO
```

Response:

```ts
SuccessResponse<SocialNetworkRecord>
```

## DELETE `/social-networks/:id`

Deletes a social network.

Auth:

```txt
Authenticated + authTherapistmiddleware
```

Response:

```ts
SuccessResponse<{
  id: string;
}>
```

---

# Social Network Users

Base module:

```txt
/api/src/api/v1/modules/socialNetworkUsers
```

## Types

```ts
export interface SocialNetworkUserRecord {
  id: string;
  socialNetworkId: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
```

```ts
export interface CreateSocialNetworkUserDTO {
  socialNetworkId: string;
  userId: string;
}
```

```ts
export interface UpdateSocialNetworkUserDTO {
  socialNetworkId?: string;
  userId?: string;
}
```

## GET `/social-network-users`

Lists social network users.

Auth:

```txt
Admin only
```

Query:

```ts
export interface ListSocialNetworkUsersQuery {
  page?: number;
  pageSize?: number;
  socialNetworkId?: string;
  userId?: string;
}
```

Response:

```ts
SuccessResponse<SocialNetworkUserRecord[]>
```

With:

```ts
meta.pagination
```

## POST `/social-network-users`

Creates a social network user relation.

Auth:

```txt
Requires authTherapistmiddleware
```

Body:

```ts
CreateSocialNetworkUserDTO
```

Response:

```ts
SuccessResponse<SocialNetworkUserRecord>
```

## GET `/social-network-users/:id`

Gets a social network user relation.

Auth:

```txt
Requires authTherapistmiddleware
```

Response:

```ts
SuccessResponse<SocialNetworkUserRecord>
```

## PUT `/social-network-users/:id`

Updates a social network user relation.

Auth:

```txt
Requires authTherapistmiddleware
```

Body:

```ts
UpdateSocialNetworkUserDTO
```

Response:

```ts
SuccessResponse<SocialNetworkUserRecord>
```

## DELETE `/social-network-users/:id`

Deletes a social network user relation.

Auth:

```txt
Requires authTherapistmiddleware
```

Response:

```ts
SuccessResponse<{
  id: string;
}>
```

---

# Messages

Base module:

```txt
/api/src/api/v1/modules/messages
```

## Types

```ts
export interface MessageRecord {
  id: string;
  content: string;
  senderId?: string;
  receiverId?: string | null;
  socialNetworkId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

```ts
export interface CreateMessageDTO {
  content: string;
}
```

## GET `/messages`

Ping endpoint.

Response:

```ts
SuccessResponse<{}>
```

## GET `/messages/dm/:userId`

Lists direct messages with a user.

Auth:

```txt
Authenticated
```

Query:

```ts
PaginationQuery
```

Response:

```ts
SuccessResponse<MessageRecord[]>
```

With:

```ts
meta.pagination
```

## POST `/messages/dm/:userId`

Creates a direct message.

Auth:

```txt
Authenticated
```

Body:

```ts
CreateMessageDTO
```

Response:

```ts
SuccessResponse<MessageRecord>
```

## GET `/messages/social-networks/:socialNetworkId`

Lists social network messages.

Auth:

```txt
Authenticated
```

Query:

```ts
PaginationQuery
```

Response:

```ts
SuccessResponse<MessageRecord[]>
```

With:

```ts
meta.pagination
```

## POST `/messages/social-networks/:socialNetworkId`

Creates a social network message.

Auth:

```txt
Authenticated
```

Body:

```ts
CreateMessageDTO
```

Response:

```ts
SuccessResponse<MessageRecord>
```

## DELETE `/messages/:id`

Deletes a message.

Auth:

```txt
Authenticated
```

Response:

```ts
SuccessResponse<{
  id: string;
}>
```

---

# Recommended Angular Services

Create or refactor these services:

```txt
src/app/services/auth.service.ts
src/app/services/user.service.ts
src/app/services/family.service.ts
src/app/services/family-member.service.ts
src/app/services/task.service.ts
src/app/services/appointment.service.ts
src/app/services/social-network.service.ts
src/app/services/social-network-user.service.ts
src/app/services/message.service.ts
```

## Service Pattern

Each data service should expose:

```ts
readonly items$: Observable<T[]>;
readonly selectedItem$: Observable<T | null>;
readonly loading$: Observable<boolean>;
readonly error$: Observable<string | null>;
```

For paginated lists:

```ts
readonly pagination$: Observable<PaginationMeta | null>;
```

## Example List Method

```ts
loadUsers(query: PaginationQuery = {}): void {
  this.loadingSubject.next(true);
  this.errorSubject.next(null);

  this.http.get<SuccessResponse<UserRecord[]>>(`${this.apiUrl}/users`, {
    params: {
      page: String(query.page ?? 1),
      pageSize: String(query.pageSize ?? 20),
    },
  }).pipe(
    finalize(() => this.loadingSubject.next(false))
  ).subscribe({
    next: (response) => {
      this.usersSubject.next(response.data);
      this.paginationSubject.next(response.meta?.pagination ?? null);
    },
    error: () => {
      this.errorSubject.next('Could not load users.');
    },
  });
}
```

## Example Create Method

```ts
createUser(payload: UserDTO): Observable<UserRecord> {
  this.loadingSubject.next(true);
  this.errorSubject.next(null);

  return this.http.post<SuccessResponse<UserRecord>>(`${this.apiUrl}/users`, payload).pipe(
    map((response) => response.data),
    tap((user) => {
      const current = this.usersSubject.value;
      this.usersSubject.next([user, ...current]);
    }),
    finalize(() => this.loadingSubject.next(false))
  );
}
```

---

# Frontend Agent Checklist

When implementing API integration:

- [ ] Use the standard `SuccessResponse<T>` interface.
- [ ] Use the standard `ErrorResponse` interface.
- [ ] Use typed DTOs.
- [ ] Keep API calls inside services.
- [ ] Expose service state as Observables.
- [ ] Use `async` pipe in templates when possible.
- [ ] Use access token in `Authorization` header for protected routes.
- [ ] Use `/auth/refresh` for access token renewal.
- [ ] Do not try to manually read the HttpOnly refresh cookie.
- [ ] Respect admin-only routes.
- [ ] Mark broken backend routes clearly in comments or TODOs.
- [ ] Do not build frontend logic that depends on currently broken backend behavior.
