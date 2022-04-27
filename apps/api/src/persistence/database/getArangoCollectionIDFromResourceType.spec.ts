import { resourceTypes } from '../../domain/types/resourceTypes';
import { getArangoCollectionIDFromResourceType } from './getArangoCollectionIDFromResourceType';
import { getAllArangoResourceCollectionIDs } from './types/ArangoCollectionId';

describe('getArangoCollectionIDFromResourceType', () => {
    const allCollectionIDs = getAllArangoResourceCollectionIDs();

    describe('every resource type', () => {
        Object.values(resourceTypes).forEach((resourceType) =>
            describe(resourceType, () => {
                it('should have a corresponding collection ID', () => {
                    const collectionID = getArangoCollectionIDFromResourceType(resourceType);

                    expect(allCollectionIDs).toContain(collectionID);
                });
            })
        );
    });

    describe('every collection type', () => {
        const allCollectionsReferencedBySomeEntity = Object.values(resourceTypes).map(
            getArangoCollectionIDFromResourceType
        );

        allCollectionIDs.forEach((collectionId) => {
            describe(collectionId, () => {
                it('should be registered for some resource', () => {
                    expect(allCollectionIDs).toContain(collectionId);
                });
            });

            describe('it should be referenced exactly once', () => {
                const numberOfTimesThisCollectionIDIsReferenced =
                    allCollectionsReferencedBySomeEntity.filter(
                        (referencedCollectionID) => collectionId === referencedCollectionID
                    ).length;

                expect(numberOfTimesThisCollectionIDIsReferenced).toBe(1);
            });
        });
    });
});
