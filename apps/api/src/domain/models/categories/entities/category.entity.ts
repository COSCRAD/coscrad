import { isDeepStrictEqual } from 'util';
import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { Valid } from '../../../domainModelValidators/Valid';
import { ValidatesItsExternalState } from '../../../interfaces/ValidatesItsExternalState';
import { InMemorySnapshot } from '../../../types/resourceTypes';
import BaseDomainModel from '../../BaseDomainModel';
import { EntityId } from '../../types/EntityId';
import InvalidExternalReferenceInCategoryError from '../errors/InvalidExternalReferenceInCategoryError';
import { ResourceOrNoteCompositeIdentifier } from '../types/ResourceOrNoteCompositeIdentifier';
import { noteType } from '../types/ResourceTypeOrNoteType';

export class Category extends BaseDomainModel implements ValidatesItsExternalState {
    id: EntityId;

    label: string;

    members: ResourceOrNoteCompositeIdentifier[];

    constructor({ id, label, members }: DTO<Category>) {
        super();

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);
    }

    validateExternalState({
        resources,
        connections,
    }: DeepPartial<InMemorySnapshot>): Valid | InternalError {
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
        const missingCompositeIDs = this.members.filter(
            (compositeID) =>
                !compositeIdentifiersInSnapshot.some((snapshotID) =>
                    isDeepStrictEqual(snapshotID, compositeID)
                )
        );

        if (missingCompositeIDs.length > 0)
            return new InvalidExternalReferenceInCategoryError(this, missingCompositeIDs);

        return Valid;
    }
}
