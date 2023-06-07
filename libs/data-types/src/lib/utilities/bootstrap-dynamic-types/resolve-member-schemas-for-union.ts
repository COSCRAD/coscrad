import { UnionMemberMetadata } from '../../decorators';
import { ClassSchema } from '../../types';

export type UnionMemberSchemaDefinition = Pick<UnionMemberMetadata, 'discriminantValue'> & {
    schema: ClassSchema;
};

export const resolveMemberSchemasForUnion = (
    _allCtorCandidates: unknown,
    _unionName: string
): UnionMemberSchemaDefinition[] => {
    throw new Error(`not implemented`);
};
