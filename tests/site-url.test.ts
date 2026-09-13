import test from "node:test";
import assert from "node:assert/strict";
import { siteUrl } from "../lib/profile";

test("deployment URL normalizes hostnames and preserves origin checks", () => {
  const keys = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"] as const;
  const old = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  try {
    for (const k of keys) delete process.env[k];
    assert.equal(siteUrl(), "http://localhost:3000");
    for (const input of ["saqibmuhammad.vercel.app", " https://saqibmuhammad.vercel.app/ "]) {
      process.env.NEXT_PUBLIC_SITE_URL = input;
      assert.equal(siteUrl(), "https://saqibmuhammad.vercel.app");
    }
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "saqibmuhammad.vercel.app";
    assert.equal(siteUrl(), "https://saqibmuhammad.vercel.app");
    process.env.NEXT_PUBLIC_SITE_URL = "javascript:alert(1)";
    assert.throws(siteUrl);
    process.env.NEXT_PUBLIC_SITE_URL = "https://user:password@example.com";
    assert.throws(siteUrl);
  } finally {
    for (const k of keys) {
      if (old[k] === undefined) delete process.env[k];
      else process.env[k] = old[k];
    }
  }
});
