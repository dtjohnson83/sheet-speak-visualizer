export const calculateNextRun = (frequency: string): Date => {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      return nextMonth;
    default:
      return now;
  }
};

export const getFrequencyIcon = (frequency: string): string => {
  switch (frequency) {
    case 'daily': return '📅';
    case 'weekly': return '📊';
    case 'monthly': return '📈';
    default: return '⏰';
  }
};

export const parseRecipientsEmail = (recipientsString: string): string[] => {
  return recipientsString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
};