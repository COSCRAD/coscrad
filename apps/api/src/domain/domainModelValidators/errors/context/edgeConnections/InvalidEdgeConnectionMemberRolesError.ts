import {
    EdgeConnectionMember,
    EdgeConnectionType,
} from 'apps/api/src/domain/models/context/edge-connection.entity';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import formatResourceCompositeIdentifier from 'apps/api/src/view-models/presentation/formatResourceCompositeIdentifier';

export default class InvalidEdgeConnectionMemberRolesError extends InternalError {
    constructor(
        edgeConnectionType: EdgeConnectionType,
        compositeIdentifiersAndRoles: Pick<EdgeConnectionMember, 'compositeIdentifier' | 'role'>[]
    ) {
        const msg = compositeIdentifiersAndRoles.reduce(
            (acc, { compositeIdentifier, role }) =>
                acc.concat(
                    [
                        `member for resource: ${formatResourceCompositeIdentifier(
                            compositeIdentifier
                        )}`,
                        `has an invalid role: ${role}`,
                    ].join(' ')
                ),
            ''
        );
        super(msg);
    }
}
