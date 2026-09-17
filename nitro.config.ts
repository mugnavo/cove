import { auditRedactPreset, type RedactConfig } from "evlog";
import evlog from "evlog/nitro/v3";
import { defineConfig } from "nitro";

const redact = {
  ...auditRedactPreset,
  paths: [...(auditRedactPreset.paths ?? []), "cookies"],
} satisfies RedactConfig;

export default defineConfig({
  // fixes SSR issues with Vite 8:
  // https://discord.com/channels/719702312431386674/1490005967067414608/1490634230458224751
  traceDeps: ["react", "react-dom"],

  experimental: {
    asyncContext: true,
  },
  modules: [
    evlog({
      env: { service: "web" },
      redact,
    }),
  ],

  /**
   * TODO(security): Review production security headers before deployment.
   *
   * App-level policies such as CSP, Permissions-Policy, X-Frame-Options /
   * frame-ancestors, COOP, Referrer-Policy, and X-Content-Type-Options are
   * intentionally not configured by the TanStarter template because safe values
   * depend on the app's embedding requirements, browser APIs, integrations, and
   * content.
   */
});
