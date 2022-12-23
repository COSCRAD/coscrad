import { FormFieldType, IFormField, isAggregateType } from '@coscrad/api-interfaces';
import {
    ComplexCoscradDataType,
    CoscradDataType,
    CoscradPropertyTypeDefinition,
    EnumTypeDefinition,
    isSimpleCoscradPropertyTypeDefinition,
} from '@coscrad/data-types';
import { isNullOrUndefined } from '@coscrad/validation';
import { InternalError } from '../../lib/errors/InternalError';

// TODO Move this to a higher level- possibly called CommandPayloadPropertyMeta
type NameLabelAndDescription = {
    name: string;
    label: string;
    description: string;
};

const lookupTable: { [K in CoscradDataType]: FormFieldType } = {
    [CoscradDataType.NonEmptyString]: FormFieldType.textField,
    [CoscradDataType.NonNegativeFiniteNumber]: FormFieldType.numericInput,
    // Eventually, we want this to be a dynamic selection
    [CoscradDataType.CompositeIdentifier]: FormFieldType.jsonInput,
    [CoscradDataType.ISBN]: FormFieldType.textField,
    [CoscradDataType.PositiveInteger]: FormFieldType.numericInput,
    [CoscradDataType.RawData]: FormFieldType.jsonInput,
    [CoscradDataType.URL]: FormFieldType.textField,
    // Eventually, we want this to be a dynamic selection
    [CoscradDataType.UUID]: FormFieldType.textField,
    [CoscradDataType.Year]: FormFieldType.yearPicker,
    [CoscradDataType.BOOLEAN]: FormFieldType.switch,
};

const buildSimpleFormField = (
    formFieldType: FormFieldType,
    { name, label, description }: NameLabelAndDescription
): IFormField => ({
    type: formFieldType,
    name,
    label,
    description,
});

/**
 * TODO A factory pattern and polymorphic builders may be cleaner here
 */
export const buildFormFieldForCommandPayloadProp = (
    propertyTypeDefinition: CoscradPropertyTypeDefinition,
    nameLabelAndDescription: NameLabelAndDescription
): IFormField => {
    if (isSimpleCoscradPropertyTypeDefinition(propertyTypeDefinition)) {
        const { coscradDataType, referenceTo } = propertyTypeDefinition;

        if (typeof referenceTo === 'string') {
            if (!isAggregateType(referenceTo)) {
                throw new InternalError(
                    `Command refers to aggregate with invalid type: ${referenceTo}`
                );
            }

            return {
                ...buildSimpleFormField(FormFieldType.dynamicSelect, nameLabelAndDescription),
                options: { aggregateType: referenceTo },
            };
        }

        const lookupResult = lookupTable[coscradDataType];

        if (isNullOrUndefined(lookupResult)) {
            throw new InternalError(
                `Failed to find a form field type for Coscrad data type: ${coscradDataType}`
            );
        }

        return buildSimpleFormField(lookupResult, nameLabelAndDescription);
    }

    const { complexDataType } = propertyTypeDefinition;

    if (complexDataType === ComplexCoscradDataType.enum) {
        const { enumLabel, enumName, labelsAndValues } =
            propertyTypeDefinition as unknown as EnumTypeDefinition;

        return {
            type: FormFieldType.staticSelect,
            label: enumLabel,
            name: enumName,
            description: 'Add property description',
            /**
             * TODO [https://www.pivotaltracker.com/story/show/184065854]
             * consolidate LabelAndValue with DisplayAndValue.
             */
            options: labelsAndValues.map(({ label, value }) => ({ display: label, value })),
        };
    }

    if (complexDataType === ComplexCoscradDataType.nested) {
        /**
         * Ideally, we will eliminate nested data from command forms. But for now,
         * we will use a JSON editor as a work around.
         */
        return buildSimpleFormField(FormFieldType.jsonInput, nameLabelAndDescription);
    }

    if (complexDataType === ComplexCoscradDataType.union) {
        throw new InternalError(`A command form should not have a union-typed property`);
    }

    const exhaustiveCheck: never = complexDataType;

    throw new InternalError(
        `Failed to generate form field for complex data type: ${exhaustiveCheck}`
    );
};
