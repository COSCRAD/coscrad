import { EdgeConnectionContext } from 'apps/api/src/domain/models/context/context.entity';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from 'apps/api/src/domain/models/context/edge-connection.entity';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { HasArangoDocumentDirectionAttributes } from '../types/HasArangoDocumentDirectionAttributes';
import mapEdgeConnectionMembersToArangoDocumentDirectionAttributes from './mapEdgeConnectionMembersToArangoDocumentDirectionAttributes';
import mapEntityDTOToDatabaseDTO from './mapEntityDTOToDatabaseDTO';

type ArangoEdgeMemberContext = {
    role: EdgeConnectionMemberRole;

    context: PartialDTO<EdgeConnectionContext>;
};

type ArangoEdgeDocumentWithoutSystemAttributes = {
    type: EdgeConnectionType;

    tagIDs: string[];

    note: string;

    members: ArangoEdgeMemberContext[];
};

export type ArangoEdgeDocument =
    HasArangoDocumentDirectionAttributes<ArangoEdgeDocumentWithoutSystemAttributes> & {
        _key: string;
    };

export default (edgeConnection: EdgeConnection): ArangoEdgeDocument =>
    mapEntityDTOToDatabaseDTO<Omit<ArangoEdgeDocument, '_key'> & { id: string }>({
        ...mapEdgeConnectionMembersToArangoDocumentDirectionAttributes(
            edgeConnection.members,
            edgeConnection.type
        ),
        ...edgeConnection,
        members: edgeConnection.members.map(({ role, context }) => ({
            role,
            context,
        })),
    });
