export type EntryType = "income" | "expense";
export type PaymentMethod =
  | "cash"
  | "debit_card"
  | "credit_card"
  | "transfer"
  | "other";

export interface Entry {
  id: string;
  type: EntryType;
  amount: number;
  date: Date;
  description?: string;
  method: PaymentMethod;
}

export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}
