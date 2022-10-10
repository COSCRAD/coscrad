import { IFormData, IFormField } from '@coscrad/api-interfaces';
import { ClassSchema } from '@coscrad/data-types';
import { buildFormFieldForCommandPayloadProp } from './buildFormFieldForCommandPayloadProp';

export const buildCommandForm = (commandType: string, schema: ClassSchema): IFormData => {
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
