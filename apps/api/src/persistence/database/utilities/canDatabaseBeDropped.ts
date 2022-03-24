import { TEST_DATABASE_PREFIX } from '../../constants/persistenceConstants';

// TODO[test] Let's add test coverage. This is pretty important behaviour!
export default (databaseName: string): boolean => databaseName.includes(TEST_DATABASE_PREFIX);
