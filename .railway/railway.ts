import { defineRailway, postgres, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const db = postgres("Postgres", { region: "us-east4-eqdc4a" });

  db.networking = { privateNetworkEndpoint: "postgres" };

  const postgresVolume = volume("postgres-volume", {
    alerts: { usage: { "100": {}, "80": {}, "95": {} } },
    allowOnlineResize: true,
    region: "us-east4-eqdc4a",
    sizeMB: 5000,
  });

  const frantssb = service("frantssb", {
    build: {
      builder: "RAILPACK",
      buildCommand: "pnpm exec playwright install --with-deps --only-shell chromium && pnpm build",
    },
    deploy: {
      preDeployCommand: ["pnpm db:migrate && pnpm articles:sync"],
      startCommand: "pnpm start",
      healthcheckPath: "/",
      healthcheckTimeout: 120,
      restartPolicyMaxRetries: 3,
    },
    replicas: { "us-east4-eqdc4a": 1 },
    env: {
      APP_ENV: "production",
      DATABASE_URL: db.env.DATABASE_URL,
      HOST: "0.0.0.0",
      RAILPACK_NODE_VERSION: "24",
      RAILPACK_NO_SPA: "true",
    },
  });

  return project("frantssb", {
    resources: [frantssb, db, postgresVolume],
  });
});
