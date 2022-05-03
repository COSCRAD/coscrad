import { Tag } from '../domain/models/tag/tag.entity';

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): Tag[] =>
    ['plants', 'animals', 'placenames', 'songs', 'legends'].map(
        (label, index) =>
            new Tag({
                id: String(index + 1),
                label,
            })
    );
