import { ResourceType } from '../domain/types/ResourceType';
import isStringWithNonzeroLength from '../lib/utilities/isStringWithNonzeroLength';
import { getArangoCollectionIDFromResourceType } from '../persistence/database/collection-references/getArangoCollectionIDFromResourceType';
import formatAggregateType from '../view-models/presentation/formatAggregateType';

Object.values(ResourceType).forEach((resourceType) => {
    describe(`${formatAggregateType(resourceType)}`, () => {
        it(`should have a corresponding collection name`, () => {
            const collectionName = getArangoCollectionIDFromResourceType(resourceType);

            expect(isStringWithNonzeroLength(collectionName)).toBe(true);
        });
    });
});
