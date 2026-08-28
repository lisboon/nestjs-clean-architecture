import { spawnSync } from "node:child_process";

const isCI = Boolean(process.env.CI) && process.env.CI !== "false";
const localDatabaseUrl =
  "postgresql://backend_test:backend_test@localhost:5433/backend_test?schema=public";
const databaseUrl = isCI
  ? process.env.DATABASE_URL
  : (process.env.E2E_DATABASE_URL ?? localDatabaseUrl);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run E2E tests in CI");
}

const testEnvironment = {
  ...process.env,
  NODE_ENV: "test",
  DATABASE_URL: databaseUrl,
  JWT_SECRET:
    process.env.JWT_SECRET ?? "test-jwt-secret-not-for-production-0123456789",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1h",
};

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: testEnvironment,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};

const waitForTestDatabase = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = spawnSync(
      "docker",
      [
        "compose",
        "--profile",
        "test",
        "exec",
        "-T",
        "backend-test-db",
        "pg_isready",
        "-U",
        "backend_test",
        "-d",
        "backend_test",
      ],
      { cwd: process.cwd(), stdio: "ignore" },
    );

    if (result.status === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("The E2E PostgreSQL container did not become ready");
};

if (!isCI && !process.env.E2E_DATABASE_URL) {
  run("docker", [
    "compose",
    "--profile",
    "test",
    "up",
    "-d",
    "--force-recreate",
    "backend-test-db",
  ]);
  await waitForTestDatabase();
}

run(process.execPath, [
  "node_modules/prisma/build/index.js",
  "migrate",
  "deploy",
]);
run(process.execPath, [
  "node_modules/jest/bin/jest.js",
  "--config",
  "./test/jest-e2e.json",
  ...process.argv.slice(2),
]);
