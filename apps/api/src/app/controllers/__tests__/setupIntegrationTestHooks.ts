import { INestApplication } from '@nestjs/common';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';

interface SetupIntegrationTestHooksArgs {
    app: INestApplication;
    // TODO Make this an interface
    testRepositoryProvider: TestRepositoryProvider;
}

/**
 * Call this helper to setup the following hooks for integration tests that hit
 * the live database:
 * - `afterAll` (close app)
 * - `beforeEach` (db test setup)
 * - `afterEach` (db test teardown)
 *
 * Note- I'm not fully sure we want to couple old tests to new tests in this way.
 * We can revert this decision as soon as new tests need to make breaking
 * changes to the following logic.
 */
export const setupIntegrationTestHooks = ({
    app,
    testRepositoryProvider,
}: SetupIntegrationTestHooksArgs) => {
    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });
};
