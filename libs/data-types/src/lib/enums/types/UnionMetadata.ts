import { ClassDataTypeMetadata } from '../../types';

type UnionMemberSchemaDefinition = {
    discriminant: string;
    schema: ClassDataTypeMetadata;
};

export type UnionMetadata = {
    discriminantPath: string;
    schemaDefinitions: UnionMemberSchemaDefinition[];
};
