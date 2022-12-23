import {
    CoscradDataType,
    ICoscradModelSchema,
    IDynamicForm,
    IFormField,
} from '@coscrad/api-interfaces';
import {
    CommandContext,
    isCommandWriteContext,
} from '../../app/controllers/command/services/command-info-service';
import { buildFormFieldForCommandPayloadProp } from './buildFormFieldForCommandPayloadProp';

export const buildCommandForm = <T extends Record<string, unknown>>(
    schema: ICoscradModelSchema<T, CoscradDataType>,
    context: CommandContext
): IDynamicForm => {
    const prepopulatedFields = isCommandWriteContext(context)
        ? {
              compositeIdentifier: context.getCompositeIdentifier(),
          }
        : {};

    const fields: IFormField[] = Object.entries(schema).reduce(
        (acc: IFormField[], [key, propertySchema]) => [
            ...acc,
            buildFormFieldForCommandPayloadProp(propertySchema, {
                name: key,
                label: propertySchema.label,
                description: propertySchema.description,
            }),
        ],
        []
    );

    return {
        fields,
        prepopulatedFields,
    };
};
