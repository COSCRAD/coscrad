const users = require('@arangodb/users');

print("Running DB Setup as root in Arangosh\n");

const dbList = db._databases();
print(`Existing Databases: ${dbList}`);

if (dbList.indexOf(process.env.ARANGO_DB_NAME) > -1) {
  print(`${process.env.ARANGO_DB_NAME} exists`);
  print("Drop database: ", process.env.ARANGO_DB_NAME);
  if (db._dropDatabase(process.env.ARANGO_DB_NAME)) {
    print("Database dropped successfully\n");
  }
}

print("Create database: ", process.env.ARANGO_DB_NAME);
if (db._createDatabase(process.env.ARANGO_DB_NAME)) {
  print("Database created successfully\n");
}
else {
  print("Failed to create database");
}

const userValid = require("@arangodb/users").isValid(process.env.ARANGO_DB_USER, process.env.ARANGO_DB_USER_PASSWORD);
print(userValid);

if (userValid) {
  print(`User: ${process.env.ARANGO_DB_USER} exists`);
}
else {
  print(`User: ${process.env.ARANGO_DB_USER} does not exist.  Attempting to create user`);
  const userCreatedResult = require('@arangodb/users').save(process.env.ARANGO_DB_USER, process.env.ARANGO_DB_USER_PASSWORD);
  print(userCreatedResult);
}

if (require("@arangodb/users").isValid(process.env.ARANGO_DB_USER, process.env.ARANGO_DB_USER_PASSWORD)) {

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
