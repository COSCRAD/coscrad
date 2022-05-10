import { isDeepStrictEqual } from 'util';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DeepPartial } from '../../../../types/DeepPartial';
import { Valid } from '../../../domainModelValidators/Valid';
import { ResourceOrNoteCompositeIdentifier } from '../../../models/categories/types/ResourceOrNoteCompositeIdentifier';
import { noteType } from '../../../models/categories/types/ResourceTypeOrNoteType';
import { InMemorySnapshot } from '../../../types/resourceTypes';

// type ResourceReferences = {
//     // TODO correlate resourceType with key
//     [K in keyof InMemorySnapshotOfResources]: EntityId[];
// };

// type NoteAndResourceReferences = {
//     resources: ResourceReferences;
//     notes: EntityId[];
// };

// const buildEmptyResourceReferences = (): ResourceReferences =>
//     Object.values(resourceTypes).reduce(
//         (acc, resourceType) => ({
//             ...acc,
//             [resourceType]: [],
//         }),
//         {}
//     );

// const buildEmptyNoteAndResourceReferences = (): NoteAndResourceReferences => ({
//     notes: [],
//     resources: buildEmptyResourceReferences(),
// });

// const sortNoteAndResourceReferences = (
//     compositeIdentifiers: ResourceOrNoteCompositeIdentifier[]
// ): NoteAndResourceReferences =>
//     compositeIdentifiers.reduce((acc: NoteAndResourceReferences, { id, type }) => {
//         // TODO Use maps instead
//         if (isResourceType(type))
//             return {
//                 ...acc,
//                 resources: {
//                     ...acc.resources,
//                     [type]: acc.resources[type].concat(id),
//                 },
//             };

//         if (type === noteType)
//             return {
//                 ...acc,
//                 notes: acc.notes.concat(id),
//             };

//         throw new InternalError(`Invalid note or resource type: ${type}`);
//     }, buildEmptyNoteAndResourceReferences());

type ErrorFactory = (invalidReferences: ResourceOrNoteCompositeIdentifier[]) => InternalError;

export default (
    { resources, connections }: DeepPartial<InMemorySnapshot>,
    modelReferences: ResourceOrNoteCompositeIdentifier[],
    buildError: ErrorFactory
): Valid | InternalError => {
    const connectionCompositeIdsInSnapshot = (connections || []).map(({ id }) => ({
        type: noteType,
        id,
    }));

    const resourceCompositeIdentifiersInSnapshot = Object.values(resources || []).flatMap(
        (resourceInstances) =>
            resourceInstances.map((instance) => instance.getCompositeIdentifier())
    );

    const compositeIdentifiersInSnapshot = [
        ...resourceCompositeIdentifiersInSnapshot,
        ...connectionCompositeIdsInSnapshot,
    ];

    // TODO [performance] Optimize this if performance becomes an issue
    const missingCompositeIDs = modelReferences.filter(
        (compositeID) =>
            !compositeIdentifiersInSnapshot.some((snapshotID) =>
                isDeepStrictEqual(snapshotID, compositeID)
            )
    );

    if (missingCompositeIDs.length > 0) return buildError(missingCompositeIDs);

    return Valid;
};
