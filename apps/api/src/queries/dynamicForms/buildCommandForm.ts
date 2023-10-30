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

// TODO We should have a SST for `rawData` as a key on all CREATE_X payloads.
const propertyKeysToOmitFromForms = [AGGREGATE_COMPOSITE_IDENTIFIER, 'rawData'];

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
            propertyKeysToOmitFromForms.includes(key)
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
