import { defineRailway, project, service } from "railway/iac";

export default defineRailway(() => {
  const frantssb = service("frantssb", {
    build: { builder: "RAILPACK", buildCommand: "pnpm build" },
    deploy: {
      startCommand: "pnpm start",
      healthcheckPath: "/",
      healthcheckTimeout: 120,
      restartPolicyMaxRetries: 3,
    },
    replicas: { "us-east4-eqdc4a": 1 },
    env: {
      APP_ENV: "production",
      HOST: "0.0.0.0",
      RAILPACK_NODE_VERSION: "24",
      RAILPACK_NO_SPA: "true",
    },
  });

  return project("frantssb", {
    resources: [frantssb],
  });
});
