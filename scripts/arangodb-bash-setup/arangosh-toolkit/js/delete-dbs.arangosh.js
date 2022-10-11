const databaseNames = db._databases();

const TEST_DB_PREFIX = 'testonly';

databaseNames.forEach(dbname => {
    if (dbname.indexOf(TEST_DB_PREFIX) > -1) {
        if (db._dropDatabase(dbname)) {
            print(`Dropped database ${dbname}`);
        }
        else {
            print(`Failed to drop database ${dbname}`);
        }
    }
    else {
        print(`${dbname} exists and was not dropped.`);
    }
});
