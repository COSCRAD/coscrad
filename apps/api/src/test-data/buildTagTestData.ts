import { Tag } from '../domain/models/tag/tag.entity';
import { resourceTypes } from '../domain/types/resourceTypes';

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): Tag[] =>
    ['plants', 'animals', 'placenames', 'songs', 'legends'].map(
        (text, index) =>
            new Tag({
                id: String(index + 1),
                text,
                published: true,
                type: resourceTypes.tag,
            })
    );
