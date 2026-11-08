# Changelog

## 2026-11-08
- Project set up: Next.js 16, TypeScript, Tailwind CSS, Vitest.
- Reconciliation engine: matches orders to courier payout lines by order id, consignment id, or phone + amount.
- Normalisation for Bangla digits, taka amounts ("৳1,250", "১২৫০", "(80)") and Bangladeshi phone numbers.
- Statuses: paid, short paid, over paid, unpaid, returned, partial, pending; summary with the amount still owed.
- 29 unit tests.
