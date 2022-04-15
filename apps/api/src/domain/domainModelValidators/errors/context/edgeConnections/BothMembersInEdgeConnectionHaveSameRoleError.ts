import { EdgeConnectionMemberRole } from 'apps/api/src/domain/models/context/edge-connection.entity';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class BothMembersInEdgeConnectionHaveSameRoleError extends InternalError {
    constructor(role: EdgeConnectionMemberRole) {
        const msg = [
            `You have specified a dual edge connection in which`,
            `both members have the same role: ${role}`,
        ].join(' ');

        super(msg);
    }
}
