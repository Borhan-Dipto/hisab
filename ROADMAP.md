# Roadmap

Hisab is built in small, shippable steps — one item per working day. Each item must
leave the app building, linted and fully tested. Tick an item (`- [x]`) in the same
commit that completes it, and add a line to `CHANGELOG.md`.

Rules for every step:
- Real behaviour only: no filler commits, no placeholder features.
- Every change to `src/lib` comes with tests.
- Courier presets are marked **unverified** until checked against a real export.

## Phase 1 — Reconciliation engine
- [x] Core types for orders and courier payout lines
- [x] Bangla digit, taka amount and BD phone normalisation
- [x] `reconcile()` — match by order id, consignment id, then phone + amount
- [x] Summary totals and outstanding amount
- [ ] CSV parsing with header auto-detection (`src/lib/csv`)
- [ ] Column mapping model: map any CSV header to an `Order` / `PayoutLine` field
- [ ] Header guessing for English and Bangla column names (e.g. "Invoice", "ইনভয়েস", "COD Amount")
- [ ] Row-level validation with readable errors (bad amount, bad phone, missing id)
- [ ] Duplicate detection: same order id twice in orders, or paid twice in payouts
- [ ] Overdue detection: delivered but unpaid for more than N days
- [ ] Courier rate card model (delivery charge by zone and weight, COD % charge)
- [ ] Overcharge detection against the rate card
- [ ] Return-charge checks for returned parcels

## Phase 2 — The app
- [ ] Upload screen: drop orders CSV and payout CSV
- [ ] Column mapping screen with guessed mappings the user can correct
- [ ] Results table with status filters and search
- [ ] Summary cards: billed, collected, fees, paid, still owed
- [ ] Order detail drawer explaining each number
- [ ] Export results to CSV
- [ ] Download a sample dataset and a "try with sample data" button
- [ ] Remember column mappings per courier in the browser
- [ ] Bangla / English interface toggle
- [ ] Printable report for a payout period
- [ ] Dark mode
- [ ] Accessibility pass (keyboard, focus, contrast, screen-reader labels)
- [ ] Handle 20,000+ rows smoothly (parse in a web worker)

## Phase 3 — Courier presets
- [ ] Steadfast payout report preset (**unverified**)
- [ ] Pathao payout report preset (**unverified**)
- [ ] RedX payout report preset (**unverified**)
- [ ] Paperfly payout report preset (**unverified**)
- [ ] Verify each preset against a real export and remove the flag

## Phase 4 — Polish and release
- [ ] Landing section explaining the problem and the three-step flow
- [ ] Screenshots and a short demo GIF in the README
- [ ] End-to-end test of the full upload → results flow
- [ ] Deploy to Vercel and add the live link
- [ ] v1.0.0 release notes
