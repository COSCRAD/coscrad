import { EdgeConnectionContext } from 'apps/api/src/domain/models/context/context.entity';
import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from 'apps/api/src/domain/models/context/edge-connection.entity';
import { DTO } from 'apps/api/src/types/DTO';
import { HasArangoDocumentDirectionAttributes } from '../types/HasArangoDocumentDirectionAttributes';

type ArangoEdgeMemberContext = {
    role: EdgeConnectionMemberRole;

    context: DTO<EdgeConnectionContext>;
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
