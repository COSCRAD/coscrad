import { entityTypes } from '../../domain/types/entityTypes';
import { getArangoCollectionIDFromEntityType } from './getArangoCollectionIDFromEntityType';
import { getAllArangoCollectionIDs } from './types/ArangoCollectionId';

describe('getArangoCollectionIDFromEntityType', () => {
    const allCollectionIDs = getAllArangoCollectionIDs();

    describe('every entity type', () => {
        Object.values(entityTypes).forEach((entityType) =>
            describe(entityType, () => {
                it('should have a corresponding collection ID', () => {
                    const collectionID = getArangoCollectionIDFromEntityType(entityType);

                    expect(allCollectionIDs).toContain(collectionID);
                });
            })
        );
    });

    describe('every collection type', () => {
        const allCollectionsReferencedBySomeEntity = Object.values(entityTypes).map(
            getArangoCollectionIDFromEntityType
        );

        allCollectionIDs.forEach((collectionId) => {
            describe(collectionId, () => {
                it('should be registered for some entity', () => {
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
