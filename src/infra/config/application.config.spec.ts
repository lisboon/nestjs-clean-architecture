import {
  ApplicationConfigError,
  loadApplicationConfig,
} from "./application.config";

const validEnvironment = (): NodeJS.ProcessEnv => ({
  NODE_ENV: "production",
  PORT: "4000",
  DATABASE_URL: "postgresql://user:password@localhost:5432/database",
  CORS_ORIGINS: "https://app.example.com, https://admin.example.com",
  JWT_SECRET: "a-secure-secret-with-at-least-32-characters",
  JWT_EXPIRES_IN: "2h",
  BCRYPT_ROUNDS: "13",
  THROTTLE_LIMIT: "50",
  THROTTLE_WINDOW_MS: "30000",
});

describe("ApplicationConfig", () => {
  it("loads and normalizes a valid environment", () => {
    const config = loadApplicationConfig(validEnvironment());

    expect(config).toEqual({
      nodeEnv: "production",
      port: 4000,
      databaseUrl: "postgresql://user:password@localhost:5432/database",
      corsOrigins: ["https://app.example.com", "https://admin.example.com"],
      jwt: {
        secret: "a-secure-secret-with-at-least-32-characters",
        expiresIn: "2h",
      },
      bcryptRounds: 13,
      throttle: {
        limit: 50,
        windowMs: 30000,
      },
    });
  });

  it("applies safe defaults to optional settings", () => {
    const config = loadApplicationConfig({
      DATABASE_URL: "postgresql://user:password@localhost:5432/database",
      JWT_SECRET: "a-secure-secret-with-at-least-32-characters",
    });

    expect(config).toMatchObject({
      nodeEnv: "development",
      port: 3001,
      corsOrigins: ["http://localhost:3000"],
      jwt: { expiresIn: "7d" },
      bcryptRounds: 12,
      throttle: { limit: 30, windowMs: 60_000 },
    });
  });

  it("accepts a short JWT secret only in the test environment", () => {
    const config = loadApplicationConfig({
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://user:password@localhost:5432/database",
      JWT_SECRET: "test-secret",
    });

    expect(config.jwt.secret).toBe("test-secret");
  });

  it("rejects a non-positive JWT expiration", () => {
    expect(() =>
      loadApplicationConfig({
        ...validEnvironment(),
        JWT_EXPIRES_IN: "0s",
      }),
    ).toThrow("JWT_EXPIRES_IN must be a positive duration");
  });

  it("reports every invalid setting in a single error", () => {
    const environment = validEnvironment();
    Object.assign(environment, {
      NODE_ENV: "staging",
      PORT: "0",
      DATABASE_URL: "mysql://localhost/database",
      CORS_ORIGINS: "not-an-origin,ftp://example.com",
      JWT_SECRET: "short",
      JWT_EXPIRES_IN: "tomorrow",
      BCRYPT_ROUNDS: "9.5",
      THROTTLE_LIMIT: "NaN",
      THROTTLE_WINDOW_MS: "-1",
    });

    expect(() => loadApplicationConfig(environment)).toThrow(
      ApplicationConfigError,
    );

    try {
      loadApplicationConfig(environment);
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationConfigError);
      expect((error as ApplicationConfigError).issues).toHaveLength(10);
    }
  });

  it("reports missing required settings together", () => {
    expect(() => loadApplicationConfig({})).toThrow(
      "Invalid application configuration:\n- DATABASE_URL is required\n- JWT_SECRET is required",
    );
  });
});
