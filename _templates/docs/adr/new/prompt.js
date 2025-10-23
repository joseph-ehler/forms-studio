const today = new Date().toISOString().split('T')[0];

module.exports = [
  {
    type: 'input',
    name: 'title',
    message: 'ADR title (kebab-case):',
    validate: (input) => {
      if (!/^[a-z][a-z0-9-]*$/.test(input)) {
        return 'Title must be kebab-case (e.g., css-layer-system)';
      }
      return true;
    },
  },
  {
    type: 'input',
    name: 'owner',
    message: 'Owner (GitHub handle):',
    default: '@joseph-ehler',
  },
  {
    type: 'list',
    name: 'status',
    message: 'Status:',
    choices: ['draft', 'accepted', 'rejected', 'superseded'],
    default: 'accepted',
  },
];

module.exports.today = today;
