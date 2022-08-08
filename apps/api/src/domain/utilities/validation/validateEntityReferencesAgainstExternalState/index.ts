import { isDeepStrictEqual } from 'util';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DeepPartial } from '../../../../types/DeepPartial';
import { Valid } from '../../../domainModelValidators/Valid';
import { CategorizableCompositeIdentifier } from '../../../models/categories/types/ResourceOrNoteCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { InMemorySnapshot } from '../../../types/ResourceType';

type ErrorFactory = (invalidReferences: CategorizableCompositeIdentifier[]) => InternalError;

export default (
    { resources, note: connections }: DeepPartial<InMemorySnapshot>,
    modelReferences: CategorizableCompositeIdentifier[],
    buildError: ErrorFactory
): Valid | InternalError => {
    const connectionCompositeIdsInSnapshot = (connections || []).map(({ id }) => ({
        type: AggregateType.note,
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
