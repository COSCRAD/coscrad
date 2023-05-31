import { ComplexCoscradDataType } from '../types/ComplexDataTypes/ComplexCoscradDataType';
import { UnionDataTypeDefinition } from '../types/ComplexDataTypes/UnionDataTypeDefinition';
import { getCoscradDataSchema } from '../utilities';
import appendMetadata from '../utilities/appendMetadata';
import getDiscriminantForUnionMember from '../utilities/getDiscriminantForUnionMember';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

// @deprecated We are phasing this out. Use `Union2` and rename this to `Union` eventually.
function Union(
    memberClasses: Object[],
    discriminantPath: string,
    userOptions: TypeDecoratorOptions
): PropertyDecorator {
    const options = mixinDefaultTypeDecoratorOptions(userOptions);

    return (target: Object, propertyKey: string | symbol) => {
        const unionDataTypeDefinition: UnionDataTypeDefinition = {
            complexDataType: ComplexCoscradDataType.union,
            discriminantPath,
            unionName: 'DEPRECATED PIECE OF TOAST',
            schemaDefinitions: memberClasses.map((MemberClass) => ({
                discriminant: getDiscriminantForUnionMember(MemberClass),
                schema: getCoscradDataSchema(MemberClass),
            })),
        };

        appendMetadata(target, propertyKey, unionDataTypeDefinition, options);
    };
}
