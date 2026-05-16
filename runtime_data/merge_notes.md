# Runtime Merge Notes

`data/runtime/` is the app-ready combined dataset.

## Merge policy

- `users`, `programs`, `applications`, `cohorts`, `relationships`, and `meetings` come from `data/mock/` unchanged because they are the only complete end-to-end flow records.
- `mentors` uses the complete mock collection as the runtime version because those rows already contain the required schema fields and were originally shaped from public-source research.
- `companies` combines:
  - 10 fully linked mock startup records used by the application flow
  - 9 source-backed startup records enriched to full schema shape so they can be imported safely for testing

## Why companies are not merged row by row

The real company set and mock company set are different startup entities with different IDs.
Because of that:

- there is no safe one-to-one merge key
- applications and relationships would break if we replaced the mock company IDs
- the runtime dataset keeps the mock flow intact and appends enriched source-backed startups as additional records

## Selected versus extra companies

Companies in `companies.csv` fall into three groups:

**Selected cohort companies** — the 10 companies linked by `companyIds` in `cohorts.csv` and `selectedCompanyIds` in `programs.csv`. These are the primary demo flow companies. Their `cohortId` is set, their `programIds` include the active program, and their `isMatched` reflects whether a mentor relationship was confirmed. Do not alter the IDs or linkage of these rows.

**Extra source-backed companies** — 9 additional enriched records (kiddocare, qarbotech, versa, teleme, capbay, bloomthis, naluri, healthmetrics, thelorry) appended for import testing and demo diversity. They carry a `cohortId` because they were enriched to full schema shape, but they are not the primary demo flow companies.

**Extra applicant companies** — companies added to resolve referential integrity for applications that pointed to missing company IDs (applicant-ledgerlane, applicant-procurenest). These have a blank `cohortId`, `isMatched` set to `false`, and `programIds` including the active program. They represent waitlisted or declined applicants and are available for import testing and fallback data but are not part of the selected demo cohort.

## Integrity rule

Every `companyId` in `applications.csv` must resolve to a row in `companies.csv`. Applications for selected cohort companies use `company-*` IDs. Applications for waitlisted or declined applicants use `applicant-*` IDs. When adding application rows, add a matching company row in the same commit.

## Intended use

Use `runtime_data/` as the dataset for:

- backend import testing
- Firestore seeding
- route integration
- UI testing
- demo fallback data

Use source-reference material only for context, not as the primary runtime dataset.
