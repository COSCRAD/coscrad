import { ClassSchema } from '../../types';

type UnionMemberSchemaDefinition = {
    discriminant: string;
    schema: ClassSchema;
};

// TODO consolidate with api-interfaces
export type UnionMetadata = {
    discriminantPath: string;
    schemaDefinitions: UnionMemberSchemaDefinition[];
};
