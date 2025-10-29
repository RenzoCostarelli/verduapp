// Format currency for es-AR locale
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date for es-AR locale
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Format date only (no time)
export const formatDateOnly = (date: Date): string => {
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

// Get current date in Argentina timezone
export const getNowInArgentina = (): Date => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Argentina/Cordoba",
  });

  const parts = formatter.formatToParts(now);
  const values: Record<string, number> = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = Number.parseInt(part.value, 10);
    }
  });

  return new Date(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );
};
