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
  created_by: string;
  created_at?: Date;
  user_email?: string;
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
