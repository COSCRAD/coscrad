import { EdgeConnectionContext } from '../../../domain/models/context/context.entity';
import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../../domain/models/context/edge-connection.entity';
import { DTO } from '../../../types/DTO';
import { HasArangoDocumentDirectionAttributes } from '../types/HasArangoDocumentDirectionAttributes';

type ArangoEdgeMemberContext = {
    role: EdgeConnectionMemberRole;

    context: DTO<EdgeConnectionContext>;
};

type ArangoEdgeDocumentWithoutSystemAttributes = {
    type: EdgeConnectionType;

    note: string;

    members: ArangoEdgeMemberContext[];
};

export type ArangoEdgeDocument =
    HasArangoDocumentDirectionAttributes<ArangoEdgeDocumentWithoutSystemAttributes> & {
        _key: string;
    };
