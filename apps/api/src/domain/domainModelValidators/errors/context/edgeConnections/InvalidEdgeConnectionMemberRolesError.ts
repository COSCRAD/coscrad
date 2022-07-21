import { InternalError } from '../../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../../view-models/presentation/formatResourceCompositeIdentifier';
import {
    EdgeConnectionMember,
    EdgeConnectionType,
} from '../../../../models/context/edge-connection.entity';

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
                    ].join(' '),
                    '/n'
                ),
            ''
        );
        super(msg);
    }
}
