import { EntityType } from '../../domain/types/entityType';
import { ArangoCollectionID } from './types/ArangoCollectionId';

// TODO [design] Should we tie this to the model constructors?
const arangoCollectionIDs: {
  [k in EntityType]: ArangoCollectionID;
} = {
  term: 'terms',
  vocabularyList: 'vocabulary_lists',
  tag: 'tags',
};

export const getArangoCollectionIDFromEntityType = (
  entityType: EntityType
): ArangoCollectionID => {
  if (Object.keys(arangoCollectionIDs).includes(entityType)) {
    const result = arangoCollectionIDs[entityType];

    return result;
  }

  throw new Error(
    `Cannot identify collection ID for unsupported entity: ${entityType}`
  );
};
