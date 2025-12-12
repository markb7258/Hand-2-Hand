import { readFileSync } from 'fs';

/**
 * Read a secret from a Docker secret file or fall back to environment variable
 * @param envVarName - Name of the environment variable (e.g., "JWT_SECRET")
 * @param secretFilePath - Optional path to secret file (defaults to /run/secrets/<envVarName>)
 * @param fallback - Fallback value if neither file nor env var exists
 */
export function getSecret(
  envVarName: string,
  secretFilePath?: string,
  fallback?: string
): string {
  // Try reading from Docker secret file first
  const filePath = secretFilePath || `/run/secrets/${envVarName.toLowerCase()}`;
  try {
    const secret = readFileSync(filePath, 'utf8').trim();
    if (secret) return secret;
  } catch {
    // File doesn't exist or can't be read - fall through to env var
  }

  // Fall back to environment variable
  const envValue = process.env[envVarName];
  if (envValue) return envValue;

  // Use fallback if provided
  if (fallback) return fallback;

  throw new Error(
    `Secret ${envVarName} not found in Docker secrets or environment variables`
  );
}

/**
 * Get DATABASE_URL from Docker secret file or environment variable
 */
export function getDatabaseUrl(): string {
  // Check for DATABASE_URL_FILE env var (points to secret file)
  const urlFile = process.env.DATABASE_URL_FILE;
  if (urlFile) {
    try {
      return readFileSync(urlFile, 'utf8').trim();
    } catch {
      // Fall through to regular env var
    }
  }

  // Try reading from standard Docker secret location
  try {
    return readFileSync('/run/secrets/db_url', 'utf8').trim();
  } catch {
    // Fall through to env var
  }

  // Fall back to DATABASE_URL env var
  const envUrl = process.env.DATABASE_URL;
  if (envUrl) return envUrl;

  throw new Error('DATABASE_URL not found in Docker secrets or environment variables');
}
