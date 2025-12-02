# Coolify API - Environment Variables Documentation

Source: Context7 + API Docs Scrape
Retrieved: 2025-12-01T23:16:00Z

## API Endpoint for Creating Environment Variables

POST /applications/{uuid}/envs

### Valid Request Body Parameters:
```json
{
  "key": "string",
  "value": "string",
  "is_preview": boolean,    // For preview deployments
  "is_literal": boolean,    // Treat value as literal (don't interpolate)
  "is_multiline": boolean,  // Value is multiline
  "is_shown_once": boolean  // Show only once for security
}
```

### Database Schema:
Columns in environment_variables table:
- `is_buildtime` (boolean) - Available at build time
- `is_runtime` (boolean) - Available at runtime

### KEY FINDING:
The API does NOT accept `is_build_time`, `is_buildtime`, or `is_runtime` in the request body.
These fields must be set via database or determined automatically by Coolify.

### CLI Command:
```bash
coolify app env create <app_uuid> --key KEY --value VALUE --build-time
```
The CLI has a `--build-time` flag but the underlying API may not support it.
