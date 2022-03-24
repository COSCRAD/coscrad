import {
    TEST_DATABASE_NAME_LENGTH,
    TEST_DATABASE_PREFIX,
} from '../../constants/persistenceConstants';

export default (): string =>
    [TEST_DATABASE_PREFIX, Math.floor(Math.random() * 10 ** TEST_DATABASE_NAME_LENGTH).toString()]
        .join('')
        .padEnd(TEST_DATABASE_NAME_LENGTH, 'X');
