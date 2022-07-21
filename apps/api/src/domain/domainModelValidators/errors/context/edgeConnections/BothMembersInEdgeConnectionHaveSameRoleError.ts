import { InternalError } from '../../../../../lib/errors/InternalError';
import { EdgeConnectionMemberRole } from '../../../../models/context/edge-connection.entity';

export default class BothMembersInEdgeConnectionHaveSameRoleError extends InternalError {
    constructor(role: EdgeConnectionMemberRole) {
        const msg = [
            `You have specified a dual edge connection in which`,
            `both members have the same role: ${role}`,
        ].join(' ');

        super(msg);
    }
}
