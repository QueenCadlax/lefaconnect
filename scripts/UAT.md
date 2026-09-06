# Local UAT Fixture

This fixture is deliberately local test data. It is not production data and does not recreate the deleted `LC-2026-6476BE` record.

## Safe development restart

`npm run dev` now removes only `.output`; it preserves `.wrangler/local-db/v3` between restarts.

## Provision the fixture

Apply migrations once, then run the documented SQL fixture:

```powershell
npx wrangler d1 migrations apply lefa-connect-db --local --persist-to .wrangler/local-db/v3 --config wrangler.jsonc
npx wrangler d1 execute lefa-connect-db --local --persist-to .wrangler/local-db/v3 --config wrangler.jsonc --file scripts/uat-local-seed.sql
```

The fixture contains:

- Admin: `qcadlax@gmail.com` / `Qcadlax-2026!`
- Active member: `stage6a.member@example.test` / `Stage6A-local-password-123!`
- Fresh applicant: `uat.fresh.applicant@example.test` / `UAT-FreshApplicant-2026!`
- Active member number: `LC-UAT-0001`
- Active application reference: `UAT-ACTIVE-0001`
- Fresh application reference: `UAT-FRESH-0001`
- Active membership: 2 slots, 20 shares
- Joining payment: R5,000, `VERIFIED`
- Monthly contribution: R1,000
- Next contribution due: `2026-10-01`

The SQL fixture is intentionally tagged with `uat_` / `UAT-` identifiers and should only be run against the local D1 database.
