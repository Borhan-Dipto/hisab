/** An order as the shop recorded it. */
export interface Order {
  /** The shop's own order or invoice number, e.g. "VST-100231". */
  orderId: string;
  /** Cash the courier was asked to collect, in taka. */
  codAmount: number;
  /** Customer phone, any common Bangladeshi format. */
  phone?: string;
  customerName?: string;
  /** The courier's tracking or consignment id, when the shop has it. */
  consignmentId?: string;
  /** ISO date (YYYY-MM-DD) the order was handed to the courier. */
  date?: string;
}

export type DeliveryStatus = "delivered" | "partial" | "returned" | "cancelled" | "pending";

/** One line of a courier's payout (settlement) report. */
export interface PayoutLine {
  /** The shop's order id as the courier recorded it (often called "invoice"). */
  orderId?: string;
  consignmentId?: string;
  phone?: string;
  status: DeliveryStatus;
  /** Cash the courier says it collected from the customer. */
  collected: number;
  deliveryCharge: number;
  codCharge: number;
  /** What the courier actually paid out to the shop for this line. */
  paid: number;
  /** ISO date the payout was made. */
  paidOn?: string;
}

export type ResultStatus =
  | "paid" // collected the full amount and paid out what we expect
  | "short_paid" // paid less than collected minus charges
  | "over_paid"
  | "unpaid" // delivered, but nothing paid out yet
  | "returned"
  | "pending" // no payout line yet
  | "partial"; // customer paid only part of the COD amount

export type MatchMethod = "order_id" | "consignment_id" | "phone_amount" | "none";

export interface OrderResult {
  order: Order;
  line?: PayoutLine;
  status: ResultStatus;
  matchedBy: MatchMethod;
  /** Cash the courier collected (0 when not delivered). */
  collected: number;
  /** Total fees the courier deducted. */
  fees: number;
  /** What should have been paid out: collected − fees. */
  expectedPayout: number;
  /** What was actually paid out. */
  paid: number;
  /** paid − expectedPayout. Negative means the shop is owed money. */
  difference: number;
}

export interface Summary {
  orders: number;
  codBilled: number;
  collected: number;
  fees: number;
  paid: number;
  /** Money still owed to the shop: shortfalls plus delivered-but-unpaid. */
  outstanding: number;
  byStatus: Record<ResultStatus, number>;
}

export interface Reconciliation {
  results: OrderResult[];
  /** Payout lines that matched no order — worth checking with the courier. */
  unmatchedLines: PayoutLine[];
  summary: Summary;
}
