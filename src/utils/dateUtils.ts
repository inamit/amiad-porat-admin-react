export const getHourStringFromDate = (date: Date): string => {
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const isSameDate = (a: Date, b: Date): boolean => {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
};
