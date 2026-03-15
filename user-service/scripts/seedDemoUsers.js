require('dotenv').config();

const users = require('../src/data/users');

const accounts = [
  {
    name: 'Admin User',
    email: 'admin@unicore.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
  },
  {
    name: 'Faculty User',
    email: 'faculty@unicore.edu',
    password: 'faculty123',
    role: 'faculty',
    department: 'CSE',
  },
  {
    name: 'Student User',
    email: 'student@unicore.edu',
    password: 'student123',
    role: 'student',
    department: 'CSE',
  },
];

const main = async () => {
  for (const account of accounts) {
    const existing = await users.findByEmail(account.email, { includeSecrets: true });

    if (!existing) {
      await users.createUser(account);
      console.log(`created ${account.email}`);
      continue;
    }

    await users.updateById(existing._id, {
      name: account.name,
      department: account.department,
      isActive: true,
      role: account.role,
    });
    console.log(`updated ${account.email}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
