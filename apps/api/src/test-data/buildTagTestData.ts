import { Tag } from '../domain/models/tag/tag.entity';
import { PartialDTO } from '../types/partial-dto';

type TagAndModels = {
  tag: PartialDTO<Tag>[];
};

export default (): TagAndModels => ({
  tag: ['plants', 'animals', 'placenames', 'songs', 'legends'].map(
    (text, index) =>
      new Tag({
        id: String(index),
        text,
        published: true,
      })
  ),
});
