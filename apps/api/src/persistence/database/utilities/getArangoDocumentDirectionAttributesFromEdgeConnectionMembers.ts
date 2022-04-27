import {
    EdgeConnectionMember,
    EdgeConnectionType,
} from 'apps/api/src/domain/models/context/edge-connection.entity';
import { ResourceCompositeIdentifier } from 'apps/api/src/domain/models/types/entityCompositeIdentifier';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { DTO } from 'apps/api/src/types/DTO';
import { HasArangoDocumentDirectionAttributes } from '../types/HasArangoDocumentDirectionAttributes';
import convertResourceCompositeIdentifierToArangoDocumentHandle from './convertResourceCompositeIdentifierToArangoDocumentHandle';

/**
 * For an edge document, Arango requires two `special attributes` `to` and `from`
 */
export default (
    members: Pick<DTO<EdgeConnectionMember>, 'role' | 'compositeIdentifier'>[],
    edgeConnectionType: EdgeConnectionType
): HasArangoDocumentDirectionAttributes => {
    if (edgeConnectionType === EdgeConnectionType.self) {
        const compositeIdentifier = members[0].compositeIdentifier;

        const compositeIdentifierInArangoFormat =
            convertResourceCompositeIdentifierToArangoDocumentHandle(compositeIdentifier);

        return {
            _to: compositeIdentifierInArangoFormat,
            _from: compositeIdentifierInArangoFormat,
        };
    }

    if (edgeConnectionType === EdgeConnectionType.dual) {
        return {
            [`_${members[0].role}`]: convertResourceCompositeIdentifierToArangoDocumentHandle(
                members[0].compositeIdentifier as ResourceCompositeIdentifier
            ),
            [`_${members[1].role}`]: convertResourceCompositeIdentifierToArangoDocumentHandle(
                members[1].compositeIdentifier as ResourceCompositeIdentifier
            ),
        } as HasArangoDocumentDirectionAttributes;
    }

    const exhaustiveCheck: never = edgeConnectionType;

    throw new InternalError(`Invalid edge connection type: ${exhaustiveCheck}`);
};
