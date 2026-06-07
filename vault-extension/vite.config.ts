import * as esbuild from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { defineConfig, type Plugin } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

const CONTENT_SCRIPT_PLATFORMS = [
  "leetcode",
  "codeforces",
  "codechef",
  "gfg",
] as const;

/** crxjs bundles from source paths; root manifest.json keeps dist paths for reference */
const crxManifest = {
  ...manifest,
  background: {
    service_worker: "src/background/index.ts",
    type: "module" as const,
  },
  content_scripts: [
    {
      matches: manifest.content_scripts[0].matches,
      js: ["src/content/leetcode.ts"],
      run_at: "document_idle" as const,
    },
    {
      matches: manifest.content_scripts[1].matches,
      js: ["src/content/codeforces.ts"],
      run_at: "document_idle" as const,
    },
    {
      matches: manifest.content_scripts[2].matches,
      js: ["src/content/codechef.ts"],
      run_at: "document_idle" as const,
    },
    {
      matches: manifest.content_scripts[3].matches,
      js: ["src/content/gfg.ts"],
      run_at: "document_idle" as const,
    },
  ],
  action: {
    ...manifest.action,
    default_popup: "src/popup/index.html",
  },
  web_accessible_resources: [
    {
      resources: ["src/notification/notification.html"],
      matches: ["<all_urls>"],
    },
  ],
};

function entryFileName(chunkInfo: { name?: string }): string {
  const name = chunkInfo.name ?? "";
  if (name === "background") return "background/index.js";
  return "assets/[name]-[hash].js";
}

/** Self-contained IIFE bundles — content scripts cannot use bare ESM imports. */
function bundleContentScriptsIife(): Plugin {
  return {
    name: "bundle-content-scripts-iife",
    async closeBundle() {
      const distDir = resolve(__dirname, "dist");
      mkdirSync(resolve(distDir, "content"), { recursive: true });

      await Promise.all(
        CONTENT_SCRIPT_PLATFORMS.map((platform) =>
          esbuild.build({
            entryPoints: [resolve(__dirname, `src/content/${platform}.ts`)],
            outfile: resolve(distDir, `content/${platform}.js`),
            bundle: true,
            format: "iife",
            platform: "browser",
            target: "chrome100",
            minify: true,
          }),
        ),
      );
    },
  };
}

/** Rewrite manifest + relocate HTML for Load Unpacked from dist/ */
function normalizeDistManifest(): Plugin {
  return {
    name: "normalize-dist-manifest",
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const manifestPath = resolve(distDir, "manifest.json");
      const builtManifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as Record<
        string,
        unknown
      >;

      builtManifest.background = {
        service_worker: "background/index.js",
        type: "module",
      };

      builtManifest.content_scripts = (
        builtManifest.content_scripts as Array<Record<string, unknown>>
      ).map((script, index) => ({
        ...script,
        js: [`content/${CONTENT_SCRIPT_PLATFORMS[index]}.js`],
      }));

      builtManifest.action = {
        ...(builtManifest.action as Record<string, unknown>),
        default_popup: "popup/index.html",
      };

      builtManifest.web_accessible_resources = [
        {
          resources: ["notification/notification.html"],
          matches: ["<all_urls>"],
        },
      ];

      writeFileSync(manifestPath, `${JSON.stringify(builtManifest, null, 2)}\n`);

      mkdirSync(resolve(distDir, "popup"), { recursive: true });
      mkdirSync(resolve(distDir, "notification"), { recursive: true });

      for (const [source, dest] of [
        [resolve(distDir, "src/popup/index.html"), resolve(distDir, "popup/index.html")],
        [
          resolve(distDir, "src/notification/notification.html"),
          resolve(distDir, "notification/notification.html"),
        ],
      ] as const) {
        const html = readFileSync(source, "utf-8").replace(
          /\.\.\/\.\.\/assets\//g,
          "../assets/",
        );
        writeFileSync(dest, html);
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [normalizeDistManifest(), bundleContentScriptsIife(), crx({ manifest: crxManifest })],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: "src/background/index.ts",
        popup: "src/popup/index.html",
        notification: "src/notification/notification.html",
      },
      output: {
        entryFileNames: entryFileName,
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
