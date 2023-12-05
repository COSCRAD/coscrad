import { UnionDataTypeDefinition } from '../types';

export const doesUnionTypeDefinitionDeepContainReferences = ({
    schemaDefinitions,
}: UnionDataTypeDefinition) => JSON.stringify(schemaDefinitions).includes(`"referenceTo":"`);
