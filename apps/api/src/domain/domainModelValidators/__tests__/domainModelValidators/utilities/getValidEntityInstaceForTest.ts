import buildTestData from '../../../../../test-data/buildTestData';
import { EntityType, EntityTypeToInstance } from '../../../../types/entityTypes';

export default <TEntityType extends EntityType>(
    entityType: TEntityType
): EntityTypeToInstance[TEntityType] =>
    buildTestData()[entityType][0] as EntityTypeToInstance[TEntityType];
