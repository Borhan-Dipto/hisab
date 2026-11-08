# Hisab · হিসাব

**Reconcile courier cash-on-delivery payouts against your orders — built for Bangladeshi online sellers.**

> 🚧 In active development. Follow progress in [ROADMAP.md](./ROADMAP.md) and [CHANGELOG.md](./CHANGELOG.md).

## The problem

Most online shops in Bangladesh sell on cash on delivery through couriers such as Steadfast, Pathao and RedX.
The courier collects the cash, deducts delivery and COD charges, and pays the shop days later in bulk.

Checking those payouts is done by hand in spreadsheets: which orders were paid, which are still owed,
which were returned, and whether the charges were right. It takes hours every week, and money slips through.

## What Hisab does

Upload your order list and the courier's payout report. Hisab matches them and tells you:

| Status | Meaning |
| --- | --- |
| **Paid** | Collected in full and paid out correctly |
| **Short paid** | Paid less than collected minus charges — the gap is shown |
| **Unpaid** | Delivered, but no money paid out yet |
| **Partial** | The customer paid only part of the COD amount |
| **Returned** | Not delivered; only the return charge applies |
| **Pending** | No payout line yet |
| **Over paid** | Paid more than expected |

…plus the total still owed to you, and payout lines that match none of your orders.

Matching is forgiving of real-world data: order ids in any case, Bangla digits (`১২৫০`),
amounts like `৳1,250` or `Tk. 1250.50`, and phone numbers in any format (`+880 1712-345678`, `01712345678`).

## Privacy

Hisab runs entirely in your browser. Your order and customer data is never uploaded to a server.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Vitest · PapaParse

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run lint
npm run build
```

The reconciliation engine lives in [`src/lib/reconcile`](./src/lib/reconcile) and has no UI dependencies.

## License

MIT
