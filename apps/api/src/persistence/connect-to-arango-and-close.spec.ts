import { Database } from 'arangojs';

describe(`Arango JS Connection`, () => {
    let database: Database;

    beforeAll(async () => {
        const adminInstance = new Database({
            url: `http://localhost:8585`,
        });

        adminInstance.useBasicAuth('root', `hardPassword2`);

        await adminInstance.dropDatabase(`create-leak`);

        database = await adminInstance.createDatabase(`create-leak`);
    });

    afterAll(() => {
        /**
         * We keep this test as a reminder to close your connection in the
         * `afterAll` when hitting the live database in a test.
         */
        database.close();
    });

    describe(`ArangoJS- does it leak?`, () => {
        describe(`the connection provider`, () => {
            it(`should provide a connection`, async () => {
                expect(database).toBeInstanceOf(Database);
            });
        });
    });
});
