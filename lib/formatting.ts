// Format currency for es-AR locale
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date for es-AR locale in Argentina timezone
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Argentina/Buenos_Aires",
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

// Get current date/time (will be saved as UTC in database, displayed in Argentina timezone)
export const getNowInArgentina = (): Date => {
  // Simply return the current date - it will be stored as UTC in the database
  // and displayed in Argentina timezone by formatDate()
  return new Date();
};
