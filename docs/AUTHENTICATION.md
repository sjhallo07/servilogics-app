## Autenticación (Email/password y proveedores Google/GitHub)

Resumen rápido — endpoints disponibles (serverless):

- POST `/api/auth/sign-in` — body: { email, password }
- POST `/api/auth/sign-in/google` — body: { id_token }
- POST `/api/auth/sign-in/github` — body: { access_token }
- POST `/api/auth/sign-up` — body: { userName, email, password }

Respuesta de éxito (200):

{
  "token": "<JWT>",
  "user": { /* user sanitized */ }
}

Uso desde el cliente (ejemplo con fetch):

1) Google Sign-In (cliente obtiene `id_token` usando Google Identity Services):

```js
const res = await fetch('/api/auth/sign-in/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id_token }),
});
const data = await res.json();
// data.token y data.user
```

2) GitHub (envía un `access_token` que obtuviste tras el flujo OAuth):

```js
const res = await fetch('/api/auth/sign-in/github', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ access_token }),
});
const data = await res.json();
```

3) Uso del JWT en peticiones protegidas:

Incluye el token en el header `Authorization`:

```js
fetch('/api/some-protected', {
  headers: { Authorization: `Bearer ${token}` },
});
```

Notas importantes
- El endpoint Google valida el `id_token` contra `https://oauth2.googleapis.com/tokeninfo`.
- El endpoint GitHub consulta `https://api.github.com/user` y `https://api.github.com/user/emails` para obtener el email.
- Si el usuario no existe en la base de datos, el servidor creará un usuario local con `authority: ['client']` y password vacío (no usable para login por contraseña).
- Configurar estas variables en producción (Vercel): `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `MONGODB_URI`.

Si prefieres que el backend implemente el flujo OAuth completo (redirección -> callback -> exchange), puedo añadir endpoints de autorización y callback y ejemplos de configuración para Vercel.
