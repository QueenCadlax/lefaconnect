import { execFileSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const email = process.argv[2]?.trim().toLowerCase();
const persistTo = ".wrangler/local-db/v3";
if (!email || !email.includes("@")) {
  console.error("Usage: npm run admin:provision -- admin@example.com");
  process.exit(1);
}

const sql = `UPDATE user SET status = 'admin' WHERE lower(email) = '${email.replaceAll("'", "''")}'`;
const sqlFile = join(tmpdir(), `lefa-admin-${process.pid}.sql`);
writeFileSync(sqlFile, `${sql};\n`, "utf8");
try {
  execFileSync(
    process.env.ComSpec ?? "cmd.exe",
    [
      "/d",
      "/s",
      "/c",
      `npx wrangler d1 execute lefa-connect-db --local --persist-to ${persistTo} --config wrangler.jsonc --file ${sqlFile}`,
    ],
    { stdio: "inherit" },
  );
} finally {
  unlinkSync(sqlFile);
}
