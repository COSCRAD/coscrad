const users = require('@arangodb/users');

print("Running DB Setup as root in Arangosh\n");

print("Drop database: ", process.env.ARANGO_DB_NAME);
if (db._dropDatabase(process.env.ARANGO_DB_NAME)) {
  print("Database dropped successfully\n");
}

print("Create database: ", process.env.ARANGO_DB_NAME);
if (db._createDatabase(process.env.ARANGO_DB_NAME)) {
  print("Database created successfully\n");
}

const userResult = users.document(process.env.ARANGO_DB_USER);

if (userResult.code !== 200) {
  print(`User: ${process.env.ARANGO_DB_USER} not found`);
}
else {
  print(`Attempting to grant user: ${process.env.ARANGO_DB_USER} permission to db`);
  
  users.grantDatabase(process.env.ARANGO_DB_USER, process.env.ARANGO_DB_NAME, 'rw')
  
  const userPermissions = users.permission(process.env.ARANGO_DB_USER, process.env.ARANGO_DB_NAME);

  if (userPermissions === 'rw') {
    print("Permission 'rw' granted to db for user: ", process.env.ARANGO_DB_USER);
  }
  else {
    print("Unable to process granting permissions to db for user: ", process.env.ARANGO_DB_USER);
  }
}
