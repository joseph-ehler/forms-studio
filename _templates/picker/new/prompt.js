module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Picker name (e.g., TimeField, PriceRangeField):'
  },
  {
    type: 'list',
    name: 'type',
    message: 'Picker type:',
    choices: ['date', 'select', 'custom']
  }
];
