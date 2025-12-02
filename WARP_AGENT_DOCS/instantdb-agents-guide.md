# InstantDB AGENTS.md Documentation
**Retrieved:** 2025-12-02T03:31:45Z
**Source:** https://www.instantdb.com/llm-rules/AGENTS.md

## Key Points for This Project

### Authentication
- InstantDB provides built-in auth: magic codes, OAuth, Clerk, custom auth
- Use `db.useAuth()` in React components to get auth state
- Auth permissions use `auth.id` which refers to the InstantDB authenticated user

### Magic Code Auth Pattern
```tsx
import { db } from '@/lib/instant';

function LoginPage() {
  const [sentEmail, setSentEmail] = useState('');
  
  // Send magic code
  const sendCode = (email) => {
    db.auth.sendMagicCode({ email })
      .then(() => setSentEmail(email));
  };
  
  // Verify code
  const verify = (code) => {
    db.auth.signInWithMagicCode({ email: sentEmail, code });
  };
}

// In components
function App() {
  const { isLoading, user, error } = db.useAuth();
  
  if (isLoading) return null;
  if (error) return <div>Error: {error.message}</div>;
  if (user) return <Dashboard user={user} />;
  return <LoginPage />;
}
```

### Permissions with auth.id
When using InstantDB auth, `auth.id` in permissions refers to the authenticated user's ID:
```typescript
notes: {
  allow: {
    view: "auth.id == data.userId",
    create: "auth.id != null && auth.id == data.userId",
    update: "auth.id == data.userId",
    delete: "auth.id == data.userId",
  },
}
```

### Admin Permissions
For admin checks, link users to profiles and use `auth.ref()`:
```typescript
countries: {
  allow: {
    view: "true",
    create: "auth.id != null && true in auth.ref('$user.profiles.isAdmin')",
    update: "auth.id != null && true in auth.ref('$user.profiles.isAdmin')",
    delete: "auth.id != null && true in auth.ref('$user.profiles.isAdmin')",
  },
}
```

## Full AGENTS.md Content

[Full documentation content from scrape...]

Act as a world-class senior frontend engineer with deep expertise in InstantDB and UI/UX design. Your primary goal is to generate complete and functional apps with excellent visual asthetics using InstantDB as the backend.

# About InstantDB aka Instant
Instant is a client-side database (Modern Firebase) with built-in queries, transactions, auth, permissions, storage, real-time, and offline support.

# Instant SDKs
Instant provides client-side JS SDKs and an admin SDK:
- `@instantdb/core` --- vanilla JS
- `@instantdb/react` --- React
- `@instantdb/react-native` --- React Native / Expo
- `@instantdb/admin` --- backend scripts / servers

[... rest of content ...]
