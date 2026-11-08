import { normalizeId, normalizePhone, roundTaka } from "./normalize";
import type {
  MatchMethod,
  Order,
  OrderResult,
  PayoutLine,
  Reconciliation,
  ResultStatus,
  Summary,
} from "./types";

export interface ReconcileOptions {
  /** Differences smaller than this (in taka) count as paid in full. Default 1. */
  tolerance?: number;
}

const STATUSES: ResultStatus[] = ["paid", "short_paid", "over_paid", "unpaid", "returned", "pending", "partial"];

/**
 * Matches each order to a courier payout line and works out what the shop is owed.
 *
 * Lines are matched by order id first, then consignment id, then phone + collected amount.
 * Each payout line is used at most once.
 */
export function reconcile(orders: Order[], lines: PayoutLine[], options: ReconcileOptions = {}): Reconciliation {
  const tolerance = options.tolerance ?? 1;
  const used = new Set<number>();

  const byOrderId = indexBy(lines, (l) => normalizeId(l.orderId));
  const byConsignment = indexBy(lines, (l) => normalizeId(l.consignmentId));
  const byPhone = indexBy(lines, (l) => normalizePhone(l.phone));

  const take = (candidates: number[] | undefined, accept: (l: PayoutLine) => boolean = () => true) => {
    const i = candidates?.find((idx) => !used.has(idx) && accept(lines[idx]));
    if (i === undefined) return undefined;
    used.add(i);
    return lines[i];
  };

  const results = orders.map((order): OrderResult => {
    let matchedBy: MatchMethod = "none";
    let line = take(byOrderId.get(normalizeId(order.orderId) ?? ""));
    if (line) matchedBy = "order_id";
    if (!line && order.consignmentId) {
      line = take(byConsignment.get(normalizeId(order.consignmentId) ?? ""));
      if (line) matchedBy = "consignment_id";
    }
    if (!line && order.phone) {
      const phone = normalizePhone(order.phone);
      line = take(phone ? byPhone.get(phone) : undefined, (l) =>
        Math.abs(l.collected - order.codAmount) <= tolerance && !normalizeId(l.orderId),
      );
      if (line) matchedBy = "phone_amount";
    }
    return evaluate(order, line, matchedBy, tolerance);
  });

  const unmatchedLines = lines.filter((_, i) => !used.has(i));
  return { results, unmatchedLines, summary: summarize(results) };
}

function evaluate(order: Order, line: PayoutLine | undefined, matchedBy: MatchMethod, tolerance: number): OrderResult {
  if (!line) {
    return { order, matchedBy, status: "pending", collected: 0, fees: 0, expectedPayout: 0, paid: 0, difference: 0 };
  }
  const fees = roundTaka(line.deliveryCharge + line.codCharge);
  const collected = line.status === "returned" || line.status === "cancelled" ? 0 : line.collected;
  // On a return the shop usually still pays the delivery (return) charge, so the payout can be negative.
  const expectedPayout = roundTaka(collected - fees);
  const paid = roundTaka(line.paid);
  const difference = roundTaka(paid - expectedPayout);

  let status: ResultStatus;
  if (line.status === "returned" || line.status === "cancelled") status = "returned";
  else if (line.status === "pending") status = "pending";
  else if (paid === 0 && expectedPayout > tolerance) status = "unpaid";
  else if (difference < -tolerance) status = "short_paid";
  else if (difference > tolerance) status = "over_paid";
  else if (line.status === "partial" || order.codAmount - collected > tolerance) status = "partial";
  else status = "paid";

  return { order, line, matchedBy, status, collected, fees, expectedPayout, paid, difference };
}

export function summarize(results: OrderResult[]): Summary {
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<ResultStatus, number>;
  let codBilled = 0, collected = 0, fees = 0, paid = 0, outstanding = 0;
  for (const r of results) {
    byStatus[r.status]++;
    codBilled += r.order.codAmount;
    collected += r.collected;
    fees += r.fees;
    paid += r.paid;
    if (r.status === "unpaid" || r.status === "short_paid") outstanding += -r.difference;
  }
  return {
    orders: results.length,
    codBilled: roundTaka(codBilled),
    collected: roundTaka(collected),
    fees: roundTaka(fees),
    paid: roundTaka(paid),
    outstanding: roundTaka(outstanding),
    byStatus,
  };
}

function indexBy<T>(items: T[], key: (item: T) => string | undefined): Map<string, number[]> {
  const map = new Map<string, number[]>();
  items.forEach((item, i) => {
    const k = key(item);
    if (!k) return;
    const list = map.get(k);
    if (list) list.push(i);
    else map.set(k, [i]);
  });
  return map;
}
