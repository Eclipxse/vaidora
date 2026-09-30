const { existsSync, writeFileSync } = require("node:fs");
const { randomBytes } = require("node:crypto");
const file = ".env.production";
if (existsSync(file)) {
  console.log(
    "Existing .env.production preserved. No credentials were changed.",
  );
} else {
  writeFileSync(
    file,
    [
      "APP_ORIGIN=https://vaidoraperfume.com",
      "APP_PORT=3080",
      `POSTGRES_PASSWORD=${randomBytes(32).toString("hex")}`,
      "ADMIN_EMAIL=owner@vaidoraperfume.com",
      `ADMIN_PASSWORD=${randomBytes(32).toString("base64url")}`,
      `SESSION_SECRET=${randomBytes(48).toString("hex")}`,
      "",
    ].join("\n"),
    { mode: 0o600, flag: "wx" },
  );
  console.log(
    "Created private .env.production with unique production credentials. Read it locally and keep it out of Git.",
  );
}
