import { Tag } from '../domain/models/tag/tag.entity';
import { PartialDTO } from '../types/partial-dto';

type TagAndModels = {
  tag: PartialDTO<Tag>[];
};

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): Tag[] =>
  ['plants', 'animals', 'placenames', 'songs', 'legends'].map(
    (text, index) =>
      new Tag({
        id: String(index),
        text,
        published: true,
      })
  );
