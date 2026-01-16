# Implementation Plan - MongoDB Schema Refinement

Refine the MongoDB setup and seed scripts to perfectly match the provided Supabase SQL schema.

## User Review Required

> [!IMPORTANT]
> This will wipe existing data in the MongoDB collections when the seed script is run to ensure the data adheres to the new schema including correct enumerations and default values.

## Proposed Changes

### Scripts

#### [MODIFY] [setup-db.ts](file:///Users/snehashis/Projects/Blood%20Req/bloodreq-admin/scripts/setup-db.ts)

- Update JSON Schema validation to include new fields (`admin_notes`, `emergency_contact`) and correct types.
- Ensure collections created match SQL table constraints where applicable.

#### [MODIFY] [seed-db.ts](file:///Users/snehashis/Projects/Blood%20Req/bloodreq-admin/scripts/seed-db.ts)

- Update all sample data objects to include the new fields from SQL analysis.
  - `users`: Add `emergency_contact`, `last_active`. Update `admin_details` with `settings`.
  - `blood_requests`: Add `admin_notes`, `updated_by` (optional), `updated_at`.
  - `fundraisers`: Ensure `updated_at` exists.
  - `donation_stories`: Add `likes`, `is_public`.
- Map SQL enums correctly:
  - `blood_donations.status`: `offered` | `accepted` | `completed`
  - `fundraiser_donations.status`: `pending` | `completed` | `failed`

## Verification Plan

### Automated Tests

- Run `npx tsx scripts/setup-db.ts` to verify valid schema creation (or handling of existing).
- Run `npx tsx scripts/seed-db.ts` and verify it runs without error, inserting 5 records per collection.
- Use `scripts/check-db.ts` (to be created if needed, or just manual check) to inspecting one document from each collection to verify fields exist.

### Manual Verification

- I will read the output of the seed script to confirm insertion.
- I will modify the seed script to log the first created user and blood request to verify internal structure.
