import {
    CoscradDataType,
    ICoscradModelSchema,
    IDynamicForm,
    IFormField,
} from '@coscrad/api-interfaces';
import { buildFormFieldForCommandPayloadProp } from './buildFormFieldForCommandPayloadProp';

export const buildCommandForm = <T extends Record<string, unknown>>(
    schema: ICoscradModelSchema<T, CoscradDataType>
): IDynamicForm => {
    const fields: IFormField[] = Object.entries(schema).reduce(
        (acc: IFormField[], [key, propertySchema]) => [
            ...acc,
            buildFormFieldForCommandPayloadProp(propertySchema, {
                name: key,
                /**
                 * TODO [https://www.pivotaltracker.com/story/show/183504291]
                 * We need decorators for command prop labels and descriptions.
                 */
                label: 'add label',
                description: 'add description',
            }),
        ],
        []
    );

    return {
        fields,
    };
};
