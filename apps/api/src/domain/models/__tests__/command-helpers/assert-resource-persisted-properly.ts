import { InternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { NotFound } from '../../../../lib/types/not-found';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { HasAggregateId } from '../../../types/HasAggregateId';
import { ResourceCompositeIdentifier } from '../../../types/ResourceCompositeIdentifier';

export const assertResourcePersistedProperly = async (
    idManager: IIdManager,
    testRepositoryProvider: TestRepositoryProvider,
    { id, type: resourceType }: ResourceCompositeIdentifier
): Promise<void> => {
    const idStatus = await idManager.status(id);

    expect(idStatus).toBe(NotAvailable);

    const searchResult = await testRepositoryProvider.forResource(resourceType).fetchById(id);

    expect(searchResult).not.toBe(NotFound);

    expect(searchResult).not.toBeInstanceOf(InternalError);

    expect((searchResult as HasAggregateId).id).toBe(id);
};
