import buildTestData from '../../../../../test-data/buildTestData';
import { EntityType } from '../../../../types/entityTypes';

export default <TEntityType extends EntityType>(entityType: TEntityType) =>
    buildTestData()[entityType][0];
