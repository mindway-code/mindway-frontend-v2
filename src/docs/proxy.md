# Proxy Documentation

## Proxy File

```txt
proxy.conf.json
```

## Purpose

The proxy allows the Angular dev server to send API requests to the backend during local development without hardcoding the backend URL in every service.

Instead of calling:

```ts
http://localhost:3000/api/users
```

The frontend can call:

```ts
/api/users
```

Angular dev server forwards `/api` to the backend.

## Recommended Proxy Example

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## Start Command

Use:

```bash
npm start
```

Recommended package script:

```json
{
  "start": "ng serve --proxy-config proxy.conf.json"
}
```

## Service Usage

Recommended:

```ts
private readonly apiUrl = '/api';

getUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/users`);
}
```

Avoid:

```ts
this.http.get('http://localhost:3000/api/users');
```

## Environments With Proxy

For development:

```ts
export const environment = {
  production: false,
  apiUrl: '/api',
};
```

For production:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
};
```

## Common Issues

### CORS Error

If the request is going through Angular dev server proxy, CORS usually should not happen.

Check:
- Did you use `/api` instead of `http://localhost:3000/api`?
- Did you start Angular with proxy config?
- Is the backend running?

### 404 Error

Check:
- Backend route exists.
- Proxy target points to the correct backend port.
- API path is correct.

### Network Error

Check:
- Backend server is running.
- Backend port matches `proxy.conf.json`.
- No firewall/process issue.

## Recommended Rule

All Angular services should read the API base URL from environment config or use `/api`.

Do not hardcode backend hostnames inside components.
