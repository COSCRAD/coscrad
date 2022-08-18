import { Valid } from '../../domain/domainModelValidators/Valid';
import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import idEquals from '../../domain/models/shared/functional/idEquals';
import { DeluxeInMemoryStore } from '../../domain/types/DeluxeInMemoryStore';
import { Snapshot } from '../../domain/types/Snapshot';
import { InternalError } from '../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../view-models/presentation/formatAggregateCompositeIdentifier';

export default (snapshot: Snapshot, connection: EdgeConnection) => {
    const deluxeInMemoryStore = new DeluxeInMemoryStore(snapshot);

    connection.members.forEach((member) => {
        const correspondingResource = deluxeInMemoryStore
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
