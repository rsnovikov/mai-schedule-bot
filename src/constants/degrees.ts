export const degrees: { [key: string]: string } = {
  bachelor: 'Бакалавриат',
  specialist: 'Специалитет',
  master: 'Магистратура',
  postgraduate: 'Аспирантура',
};

export const degreesRegexps = [
  {
    regexp: '^[МТ]([1-9]|1[0-2]])[ОЗ]-\\d\\d\\dБ(ки|к)?-(1[5-9]|2[0-2])$',
    value: degrees.bachelor,
  },
  {
    regexp: '^[МТ]([1-9]|1[0-2]])[ОЗ]-\\d\\d\\dС(ки|к)?-(1[5-9]|2[0-2])$',
    value: degrees.specialist,
  },
  {
    regexp: '^[МТ]([1-9]|1[0-2]])[ОЗ]-\\d\\d\\dМ(ки|к)?-(1[5-9]|2[0-2])$',
    value: degrees.master,
  },
  {
    regexp: '^[МТ]([1-9]|1[0-2]])[ОЗ]-\\d\\d\\dА(ки|к)?-(1[5-9]|2[0-2])$',
    value: degrees.postgraduate,
  },
];
