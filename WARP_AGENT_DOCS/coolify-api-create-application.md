# Coolify API Documentation - Create Application

Source: Context7 /websites/coolify_io
Retrieved: 2025-12-01T22:51:43Z
Topic: API applications endpoint POST

## Create Application Endpoint

### Endpoint
POST https://app.coolify.io/api/v1/applications/public

### Authentication
Bearer token in Authorization header

### Required Fields
- project_uuid (string)
- server_uuid (string)
- environment_name OR environment_uuid (string)
- git_repository (string)
- git_branch (string)
- build_pack (string) - e.g., "nixpacks", "dockerfile"
- destination_uuid (string)
- name (string)

### Important Optional Fields
- private_key_id (integer) - ID of the SSH private key for private GitHub repos
- ports_mappings (string) - Format: "host_port:container_port" (e.g., "3000:3000")
- fqdn (string) - Domain (leave empty for port-only deployment)
- instant_deploy (boolean) - Deploy immediately after creation

### Example Request (cURL)
```bash
curl https://app.coolify.io/api/v1/applications/public \
  --request POST \
  --header 'Authorization: Bearer Token' \
  --header 'Content-Type: application/json' \
  --data '{
    "project_uuid": "string",
    "server_uuid": "string",
    "environment_name": "production",
    "git_repository": "git@github.com:user/repo.git",
    "git_branch": "main",
    "build_pack": "nixpacks",
    "destination_uuid": "string",
    "name": "my-app",
    "ports_mappings": "3000:3000",
    "private_key_id": 1
  }'
```

### Response
Returns the created application object with UUID and other details.
