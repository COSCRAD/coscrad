import { AggregateId } from '../../../../domain/types/AggregateId';
import { InternalError } from '../../../../lib/errors/InternalError';
import { HasArangoDocumentDirectionAttributes } from '../../../database/types/HasArangoDocumentDirectionAttributes';
import convertArangoDocumentHandleToCompositeIdentifier from '../../../database/utilities/convertArangoDocumentHandleToCompositeIdentifier';

type LookupTableForChildrenIDs = Map<AggregateId, AggregateId[]>;

export default (edges: HasArangoDocumentDirectionAttributes[]): LookupTableForChildrenIDs =>
    edges.reduce((parentToChildrenMap: LookupTableForChildrenIDs, { _from, _to }) => {
        if (!_from) {
            throw new InternalError('Missing _from attribute');
        }

        if (!_to) {
            throw new InternalError('Missing _to attribute');
        }

        const parentId = convertArangoDocumentHandleToCompositeIdentifier(_from).id;

        const childId = convertArangoDocumentHandleToCompositeIdentifier(_to).id;

        if (!parentToChildrenMap.has(parentId)) parentToChildrenMap.set(parentId, []);

        parentToChildrenMap.get(parentId).push(childId);

        return parentToChildrenMap;
    }, new Map());
