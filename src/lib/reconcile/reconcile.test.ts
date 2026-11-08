import { describe, expect, it } from "vitest";
import { normalizePhone, parseTaka, reconcile } from "./index";
import type { Order, PayoutLine } from "./index";

const line = (over: Partial<PayoutLine>): PayoutLine => ({
  status: "delivered",
  collected: 0,
  deliveryCharge: 0,
  codCharge: 0,
  paid: 0,
  ...over,
});

describe("parseTaka", () => {
  it.each([
    ["৳1,250", 1250],
    ["Tk. 1250.50", 1250.5],
    ["১২৫০", 1250],
    ["(80)", -80],
    ["-80", -80],
    ["", 0],
    [null, 0],
    [990, 990],
  ])("parses %s", (input, expected) => {
    expect(parseTaka(input)).toBe(expected);
  });

  it("returns NaN for text", () => {
    expect(parseTaka("abc")).toBeNaN();
  });
});

describe("normalizePhone", () => {
  it.each(["+8801712345678", "8801712345678", "01712-345678", "1712345678", "০১৭১২৩৪৫৬৭৮"])("normalises %s", (p) => {
    expect(normalizePhone(p)).toBe("01712345678");
  });

  it.each(["01212345678", "12345", "", undefined])("rejects %s", (p) => {
    expect(normalizePhone(p)).toBeUndefined();
  });
});

describe("reconcile", () => {
  const orders: Order[] = [
    { orderId: "VST-1001", codAmount: 1250, phone: "01712345678" },
    { orderId: "VST-1002", codAmount: 990 },
    { orderId: "VST-1003", codAmount: 1500 },
    { orderId: "VST-1004", codAmount: 800 },
    { orderId: "VST-1005", codAmount: 2000, consignmentId: "SF-77" },
    { orderId: "VST-1006", codAmount: 650, phone: "+880 1811-223344" },
    { orderId: "VST-1007", codAmount: 1200 },
  ];

  const lines: PayoutLine[] = [
    line({ orderId: "vst-1001", collected: 1250, deliveryCharge: 60, codCharge: 12.5, paid: 1177.5 }),
    line({ orderId: "VST-1002", collected: 990, deliveryCharge: 60, codCharge: 9.9, paid: 850 }),
    line({ orderId: "VST-1003", status: "returned", collected: 0, deliveryCharge: 60, codCharge: 0, paid: -60 }),
    line({ orderId: "VST-1004", collected: 800, deliveryCharge: 60, codCharge: 8, paid: 0 }),
    line({ consignmentId: "sf-77", collected: 2000, deliveryCharge: 110, codCharge: 20, paid: 1870 }),
    line({ phone: "01811223344", collected: 650, deliveryCharge: 60, codCharge: 6.5, paid: 583.5 }),
    line({ orderId: "VST-1007", status: "partial", collected: 600, deliveryCharge: 60, codCharge: 6, paid: 534 }),
    line({ orderId: "VST-9999", collected: 500, deliveryCharge: 60, codCharge: 5, paid: 435 }),
  ];

  const { results, unmatchedLines, summary } = reconcile(orders, lines);
  const byId = Object.fromEntries(results.map((r) => [r.order.orderId, r]));

  it("marks a correct payout as paid, matching ids case-insensitively", () => {
    expect(byId["VST-1001"]).toMatchObject({ status: "paid", matchedBy: "order_id", fees: 72.5, difference: 0 });
  });

  it("flags a short payment and how much is missing", () => {
    expect(byId["VST-1002"]).toMatchObject({ status: "short_paid", expectedPayout: 920.1, difference: -70.1 });
  });

  it("treats returns as returned, with the return charge as the payout", () => {
    expect(byId["VST-1003"]).toMatchObject({ status: "returned", collected: 0, expectedPayout: -60, difference: 0 });
  });

  it("flags delivered orders that were never paid out", () => {
    expect(byId["VST-1004"]).toMatchObject({ status: "unpaid", expectedPayout: 732, difference: -732 });
  });

  it("falls back to the consignment id", () => {
    expect(byId["VST-1005"]).toMatchObject({ status: "paid", matchedBy: "consignment_id" });
  });

  it("falls back to phone and amount when the courier has no order id", () => {
    expect(byId["VST-1006"]).toMatchObject({ status: "paid", matchedBy: "phone_amount" });
  });

  it("recognises partial deliveries", () => {
    expect(byId["VST-1007"]).toMatchObject({ status: "partial", collected: 600 });
  });

  it("lists payout lines that match no order", () => {
    expect(unmatchedLines.map((l) => l.orderId)).toEqual(["VST-9999"]);
  });

  it("adds up what is still owed", () => {
    expect(summary.outstanding).toBe(802.1);
    expect(summary.byStatus).toMatchObject({ paid: 3, short_paid: 1, unpaid: 1, returned: 1, partial: 1 });
  });

  it("leaves orders with no payout line as pending", () => {
    const r = reconcile([{ orderId: "X-1", codAmount: 500 }], []);
    expect(r.results[0]).toMatchObject({ status: "pending", matchedBy: "none" });
  });

  it("never uses one payout line for two orders", () => {
    const r = reconcile(
      [
        { orderId: "A", codAmount: 500, phone: "01712345678" },
        { orderId: "B", codAmount: 500, phone: "01712345678" },
      ],
      [line({ phone: "01712345678", collected: 500, paid: 440, deliveryCharge: 60 })],
    );
    expect(r.results.map((x) => x.status)).toEqual(["paid", "pending"]);
  });
});
