import { ComplexCoscradDataType } from '../types/ComplexDataTypes/ComplexCoscradDataType';
import { UnionDataTypeDefinition } from '../types/ComplexDataTypes/UnionDataTypeDefinition';
import { getCoscradDataSchema } from '../utilities';
import appendMetadata from '../utilities/appendMetadata';
import getDiscriminantForUnionMember from '../utilities/getDiscriminantForUnionMember';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

/**
 * TODO  [https://www.pivotaltracker.com/n/projects/2536370/stories/183320394]
 * We should have a test that validates the `discriminantPath` or else
 * we should validate the path here.
 */
export function Union(
    memberClasses: Object[],
    discriminantPath: string,
    userOptions: Partial<TypeDecoratorOptions> = {}
): PropertyDecorator {
    const options = mixinDefaultTypeDecoratorOptions(userOptions);

    return (target: Object, propertyKey: string | symbol) => {
        const unionDataTypeDefinition: UnionDataTypeDefinition = {
            complexDataType: ComplexCoscradDataType.union,
            discriminantPath,
            schemaDefinitions: memberClasses.map((MemberClass) => ({
                discriminant: getDiscriminantForUnionMember(MemberClass),
                schema: getCoscradDataSchema(MemberClass),
            })),
        };

        appendMetadata(target, propertyKey, unionDataTypeDefinition, options);
    };
}
