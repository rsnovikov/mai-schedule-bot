import { addZero, findDayFromString } from './utils';
import { months } from '../constants/months';

export const formatDate = (date: string, separator = '-') => {
  const day = findDayFromString(date);
  const month = addZero(
    months.findIndex((item) =>
      date.toLowerCase().includes(item.toLowerCase()),
    ) + 1,
  );
  const year = new Date().getFullYear();
  return `${year}-${month}-${day}`;
};
