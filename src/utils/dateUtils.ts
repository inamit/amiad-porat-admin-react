export const getHourStringFromDate = (date: Date): string => {
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};
