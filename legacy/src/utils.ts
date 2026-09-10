export const getIslamicDate = (date: Date = new Date()) => {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch (e) {
    // Fallback if browser doesn't support islamic calendar formatting
    return date.toLocaleDateString('ar-EG');
  }
};

export const getDayOfYear = (now: Date = new Date()) => {
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const getTodayDateStr = (now: Date = new Date()) => {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const toEasternArabicNumerals = (num: number | string) => {
  const westernNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const easternNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, w => easternNumerals[westernNumerals.indexOf(w)]);
};

export const track = (eventName: string, properties?: Record<string, any>) => {
  // Mock analytics module as requested
  console.log(`[Analytics] ${eventName}`, properties);
};
