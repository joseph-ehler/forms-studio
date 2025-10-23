module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Primitive name (PascalCase):',
    validate: (input) => {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
        return 'Name must be PascalCase (e.g., Button, Stack, MediaContainer)';
      }
      return true;
    },
  },
  {
    type: 'input',
    name: 'description',
    message: 'Short description:',
    default: (answers) => `${answers.name} primitive component`,
  },
];
