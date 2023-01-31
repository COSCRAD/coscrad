import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../domain/types/ResourceType';
import buildTestDataInFlatFormat from './buildTestDataInFlatFormat';

/**
 * @deprecated Use `buildTestDataInFlatFormat`
 *
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): InMemorySnapshot =>
    new DeluxeInMemoryStore(buildTestDataInFlatFormat()).fetchFullSnapshotInLegacyFormat();
