import { Database } from 'arangojs';
import { ArangoDatabase } from '../arango-database';

export default class ArangoTestDatabase extends ArangoDatabase {
  readonly #testDatabaseName = 'e2etestdb';

  constructor(database: Database) {
    super(database);
  }

  async addTestDatabase(): Promise<void> {
    await Promise.resolve();
  }
}
