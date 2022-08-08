import { Valid } from '../../domain/domainModelValidators/Valid';
import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import idEquals from '../../domain/models/shared/functional/idEquals';
import { DeluxInMemoryStore } from '../../domain/types/DeluxInMemoryStore';
import { Snapshot } from '../../domain/types/Snapshot';
import { InternalError } from '../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../view-models/presentation/formatAggregateCompositeIdentifier';

export default (snapshot: Snapshot, connection: EdgeConnection) => {
    const deluxInMemoryStore = new DeluxInMemoryStore(snapshot);

    connection.members.forEach((member) => {
        const correspondingResource = deluxInMemoryStore
            .fetchAllOfType(member.compositeIdentifier.type)
            .find(idEquals(member.compositeIdentifier.id));

        // there is a separate test that ensures existence
        if (!correspondingResource) {
            throw new InternalError(
                `Failed to find the test data: ${formatAggregateCompositeIdentifier(
                    member.compositeIdentifier
                )}`
            );
        }

        const contextStateValidationResult = correspondingResource.validateContext(member.context);

        expect(contextStateValidationResult).toBe(Valid);
    });
};
