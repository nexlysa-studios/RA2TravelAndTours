import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_SUPABASE_");
  if (
    command === "build" &&
    (!(env.VITE_SUPABASE_URL || env.VITE_SUPABASE_PROJECT_ID) || !env.VITE_SUPABASE_PUBLISHABLE_KEY)
  ) {
    throw new Error(
      "RA2 requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY. Add the public project settings in Netlify's build environment (or .env locally), then rebuild.",
    );
  }
  return {
    // Compile GSAP into the server bundle. Leaving it external lets Netlify's
    // Node runtime resolve its CommonJS entry and reject named ESM exports.
    ssr: { noExternal: [/^gsap(?:\/|$)/] },
    // Netlify's deploy context is build metadata; retain it in the SSR bundle.
    define: {
      "import.meta.env.RA2_DEPLOY_CONTEXT": JSON.stringify(process.env.CONTEXT || ""),
    },
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      tanstackStart({ server: { entry: "server" } }),
      react(),
      netlify({
        // Bookings use hosted Supabase Edge Functions. No Netlify edge runtime
        // is needed locally; its Deno emulator can fail on unsupported flags.
        dev: { edgeFunctions: { enabled: false } },
      }),
    ],
  };
});
