import ms, { StringValue } from "ms";

const DEFAULT_PORT = 3001;
const DEFAULT_BCRYPT_ROUNDS = 12;
const MIN_BCRYPT_ROUNDS = 10;
const MAX_BCRYPT_ROUNDS = 15;
const MIN_JWT_SECRET_LENGTH = 32;

export type NodeEnvironment = "development" | "test" | "production";

export interface JwtConfig {
  secret: string;
  expiresIn: StringValue;
}

export interface ApplicationConfig {
  nodeEnv: NodeEnvironment;
  port: number;
  databaseUrl: string;
  corsOrigins: string[];
  jwt: JwtConfig;
  bcryptRounds: number;
  throttle: {
    limit: number;
    windowMs: number;
  };
}

export class ApplicationConfigError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid application configuration:\n- ${issues.join("\n- ")}`);
    this.name = ApplicationConfigError.name;
  }
}

export function loadApplicationConfig(
  environment: NodeJS.ProcessEnv = process.env,
): ApplicationConfig {
  const issues: string[] = [];
  const nodeEnv = parseNodeEnvironment(environment.NODE_ENV, issues);
  const databaseUrl = parseDatabaseUrl(environment.DATABASE_URL, issues);
  const jwtSecret = parseJwtSecret(environment.JWT_SECRET, nodeEnv, issues);
  const jwtExpiresIn = parseJwtExpiration(environment.JWT_EXPIRES_IN, issues);

  const config: ApplicationConfig = {
    nodeEnv,
    port: parseInteger(
      "PORT",
      environment.PORT,
      DEFAULT_PORT,
      1,
      65_535,
      issues,
    ),
    databaseUrl,
    corsOrigins: parseCorsOrigins(environment.CORS_ORIGINS, issues),
    jwt: {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn,
    },
    bcryptRounds: parseInteger(
      "BCRYPT_ROUNDS",
      environment.BCRYPT_ROUNDS,
      DEFAULT_BCRYPT_ROUNDS,
      MIN_BCRYPT_ROUNDS,
      MAX_BCRYPT_ROUNDS,
      issues,
    ),
    throttle: {
      limit: parseInteger(
        "THROTTLE_LIMIT",
        environment.THROTTLE_LIMIT,
        30,
        1,
        Number.MAX_SAFE_INTEGER,
        issues,
      ),
      windowMs: parseInteger(
        "THROTTLE_WINDOW_MS",
        environment.THROTTLE_WINDOW_MS,
        60_000,
        1,
        Number.MAX_SAFE_INTEGER,
        issues,
      ),
    },
  };

  if (issues.length > 0) {
    throw new ApplicationConfigError(issues);
  }

  return config;
}

function parseNodeEnvironment(
  raw: string | undefined,
  issues: string[],
): NodeEnvironment {
  const value = raw ?? "development";
  if (value === "development" || value === "test" || value === "production") {
    return value;
  }

  issues.push("NODE_ENV must be development, test, or production");
  return "development";
}

function parseDatabaseUrl(raw: string | undefined, issues: string[]): string {
  if (!raw) {
    issues.push("DATABASE_URL is required");
    return "";
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
      issues.push("DATABASE_URL must use the postgresql or postgres protocol");
    }
  } catch {
    issues.push("DATABASE_URL must be a valid URL");
  }

  return raw;
}

function parseJwtSecret(
  raw: string | undefined,
  nodeEnv: NodeEnvironment,
  issues: string[],
): string {
  if (!raw) {
    issues.push("JWT_SECRET is required");
    return "";
  }

  if (nodeEnv !== "test" && raw.length < MIN_JWT_SECRET_LENGTH) {
    issues.push(
      `JWT_SECRET must contain at least ${MIN_JWT_SECRET_LENGTH} characters outside the test environment`,
    );
  }

  return raw;
}

function parseJwtExpiration(
  raw: string | undefined,
  issues: string[],
): StringValue {
  const value = (raw ?? "7d") as StringValue;
  const duration = ms(value);
  if (duration === undefined || duration <= 0) {
    issues.push(
      "JWT_EXPIRES_IN must be a positive duration, such as 15m, 1h, or 7d",
    );
  }
  return value;
}

function parseCorsOrigins(raw: string | undefined, issues: string[]): string[] {
  const origins = (raw ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    issues.push("CORS_ORIGINS must contain at least one origin");
  }

  for (const origin of origins) {
    try {
      const url = new URL(origin);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        issues.push(`CORS_ORIGINS contains an unsupported origin: ${origin}`);
      }
    } catch {
      issues.push(`CORS_ORIGINS contains an invalid origin: ${origin}`);
    }
  }

  return origins;
}

function parseInteger(
  name: string,
  raw: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
  issues: string[],
): number {
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    issues.push(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
}
