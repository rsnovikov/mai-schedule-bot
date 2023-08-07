export const addZero = (num: number): string =>
  num < 10 ? `0${num}` : String(num);

export const findDayFromString = (string: string): string => {
  const arr = string.split('');
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].trim() && !Number.isNaN(Number(arr[i]))) {
      return `${arr[i]}${arr[i + 1]}`;
    }
  }
  return '01';
};
