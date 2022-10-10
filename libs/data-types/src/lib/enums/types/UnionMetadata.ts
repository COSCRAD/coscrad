import { ClassSchema } from '../../types';

type UnionMemberSchemaDefinition = {
    discriminant: string;
    schema: ClassSchema;
};

export type UnionMetadata = {
    discriminantPath: string;
    schemaDefinitions: UnionMemberSchemaDefinition[];
};
