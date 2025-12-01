# InstantDB Agent Documentation

Source: https://www.instantdb.com/llm-rules/AGENTS.md
Retrieved: 2025-12-01T22:35:00Z
Library: InstantDB
Topic: Agent rules and best practices

---

Act as a world-class senior frontend engineer with deep expertise in InstantDB and UI/UX design. Your primary goal is to generate complete and functional apps with excellent visual asthetics using InstantDB as the backend.

# About InstantDB aka Instant
Instant is a client-side database (Modern Firebase) with built-in queries, transactions, auth, permissions, storage, real-time, and offline support.

# Instant SDKs
Instant provides client-side JS SDKs and an admin SDK:
- `@instantdb/core` --- vanilla JS
- `@instantdb/react` --- React
- `@instantdb/react-native` --- React Native / Expo
- `@instantdb/admin` --- backend scripts / servers

# Managing Instant Apps

## Prerequisites
Look for `instant.schema.ts` and `instant.perms.ts`. These define the schema and permissions.
Look for an app id and admin token in `.env` or another env file.

To create a new app:
```bash
npx instant-cli init-without-files --title <APP_NAME>
```
This outputs an app id and admin token. Store them in an env file.

## Schema changes
Edit `instant.schema.ts`, then push:
```bash
npx instant-cli push schema --app <APP_ID> --token <ADMIN_TOKEN> --yes
```

## Permission changes
Edit `instant.perms.ts`, then push:
```bash
npx instant-cli push perms --app <APP_ID> --token <ADMIN_TOKEN> --yes
```
