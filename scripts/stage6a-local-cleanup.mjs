import { execFileSync } from "node:child_process";
import { mkdtempSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const persistTo = ".wrangler/local-db/v3";

const sql = `
DELETE FROM audit_log WHERE actor_user_id IN (SELECT id FROM user WHERE email IN ('stage6a.member@example.test', 'qcadlax@gmail.com')) OR id LIKE 'stage6a_%' OR entity_id LIKE 'stage6a_%';
DELETE FROM contribution_credit WHERE membership_id = 'stage6a_membership' OR id LIKE 'stage6a_%';
DELETE FROM contribution_payment WHERE membership_id = 'stage6a_membership' OR idempotency_key LIKE 'STAGE6A-%';
DELETE FROM contribution_period WHERE membership_id = 'stage6a_membership';
DELETE FROM contribution_schedule WHERE membership_id = 'stage6a_membership';
DELETE FROM membership_slot WHERE membership_id = 'stage6a_membership';
DELETE FROM membership_selection WHERE id = 'stage6a_membership_selection';
DELETE FROM membership WHERE membership_number = 'LC-TEST6A-0001';
DELETE FROM application_step WHERE application_id = 'stage6a_membership_application';
DELETE FROM next_of_kin WHERE application_id = 'stage6a_membership_application';
DELETE FROM referral WHERE referred_application_id = 'stage6a_membership_application';
DELETE FROM membership_rule_version WHERE id = 'stage6a_rule_version';
DELETE FROM membership_application WHERE id = 'stage6a_membership_application';
DELETE FROM applicant_profile WHERE id = 'stage6a_applicant_profile';
DELETE FROM session WHERE token IN ('stage6a-member-session', 'stage6a-admin-session') OR user_id IN (SELECT id FROM user WHERE email IN ('stage6a.member@example.test', 'qcadlax@gmail.com'));
DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email IN ('stage6a.member@example.test', 'qcadlax@gmail.com'));
DELETE FROM user WHERE email IN ('stage6a.member@example.test', 'qcadlax@gmail.com');
`;

const sqlFile = join(mkdtempSync(join(tmpdir(), "lefa-stage6a-cleanup-")), "stage6a-cleanup.sql");
writeFileSync(sqlFile, `${sql.trim()}\n`, "utf8");
const popKeys = [
  "proof-of-payment/stage6a_membership/stage6a_period_past/stage6a-pop-verified.png",
  "proof-of-payment/stage6a_membership/stage6a_period_current/stage6a-pop-pending.png",
  "proof-of-payment/stage6a_membership/stage6a_period_current/stage6a-pop-rejected.png",
];
try {
  execFileSync(
    process.env.ComSpec ?? "sh",
    [
      "/d",
      "/s",
      "/c",
      `npx --yes wrangler@4.127.0 d1 execute lefa-connect-db --local --persist-to ${persistTo} --config wrangler.jsonc --file ${sqlFile}`,
    ],
    { stdio: "inherit" },
  );
  for (const key of popKeys) {
    try {
      execFileSync(
        process.env.ComSpec ?? "sh",
        [
          "/d",
          "/s",
          "/c",
          `npx --yes wrangler@4.127.0 r2 object delete lefa-connect-storage-preview/${key} --local --persist-to ${persistTo}`,
        ],
        { stdio: "inherit", timeout: 15_000 },
      );
    } catch {
      // Local R2 cleanup is best effort; database fixture cleanup must continue.
    }
  }
  console.log("Stage 6A local bootstrap cleanup removed all tagged records.");
} finally {
  unlinkSync(sqlFile);
}
