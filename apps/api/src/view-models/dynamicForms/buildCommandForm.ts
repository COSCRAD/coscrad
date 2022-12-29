import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
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
              [AGGREGATE_COMPOSITE_IDENTIFIER]: context.getCompositeIdentifier(),
          }
        : {};

    const fields: IFormField[] = Object.entries(schema).reduce(
        (acc: IFormField[], [key, propertySchema]) =>
            key === AGGREGATE_COMPOSITE_IDENTIFIER
                ? acc
                : [
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
