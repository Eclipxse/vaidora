const { existsSync, writeFileSync, mkdirSync } = require("node:fs");
const { randomBytes } = require("node:crypto");
if (!existsSync(".env")) {
  const db = randomBytes(24).toString("hex"),
    password = randomBytes(18).toString("base64url");
  writeFileSync(
    ".env",
    `DATABASE_URL="postgresql://vaidora:${db}@127.0.0.1:5438/vaidora"\nPOSTGRES_PASSWORD="${db}"\nADMIN_EMAIL="owner@vaidora.local"\nADMIN_PASSWORD="${password}"\nSESSION_SECRET="${randomBytes(48).toString("hex")}"\nAPP_ORIGIN="http://localhost:3000"\n`,
  );
  mkdirSync("private", { recursive: true });
  writeFileSync(
    "private/LOCAL_ACCESS.md",
    `# Local owner access\n\nOpen http://localhost:3000/admin\n\nEmail: owner@vaidora.local\n\nPassword: ${password}\n\nThese credentials are generated for your local installation. Keep this file private. Set new credentials and a new SESSION_SECRET on your production host.\n`,
  );
}
