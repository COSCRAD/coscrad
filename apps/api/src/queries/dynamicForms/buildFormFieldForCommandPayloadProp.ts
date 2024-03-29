import { FormFieldType, IFormField, isAggregateType } from '@coscrad/api-interfaces';
import {
    ComplexCoscradDataType,
    CoscradDataType,
    CoscradPropertyTypeDefinition,
    EnumTypeDefinition,
    getConstraintNamesForCoscradDataType,
    isSimpleCoscradPropertyTypeDefinition,
} from '@coscrad/data-types';
import { CoscradConstraint, isNullOrUndefined } from '@coscrad/validation-constraints';
import { InternalError } from '../../lib/errors/InternalError';

// TODO Move this to a higher level- possibly called CommandPayloadPropertyMeta
type NameLabelAndDescription = {
    name: string;
    label: string;
    description: string;
};

const lookupTable: { [K in CoscradDataType]: FormFieldType } = {
    [CoscradDataType.NonEmptyString]: FormFieldType.textField,
    [CoscradDataType.PageNumber]: FormFieldType.textField,
    [CoscradDataType.FiniteNumber]: FormFieldType.numericInput,
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
    [CoscradDataType.Boolean]: FormFieldType.switch,
    [CoscradDataType.String]: FormFieldType.textField,
    // TODO Remove the following
    [CoscradDataType.FixedValue]: FormFieldType.textField,
};

const buildSimpleFormField = (
    formFieldType: FormFieldType,
    { name, label, description }: NameLabelAndDescription,
    propertyTypeDefinition: CoscradPropertyTypeDefinition
): IFormField => ({
    type: formFieldType,
    name,
    label,
    description,
    constraints: isSimpleCoscradPropertyTypeDefinition(propertyTypeDefinition)
        ? getConstraintNamesForCoscradDataType(propertyTypeDefinition.coscradDataType, {
              isArray: propertyTypeDefinition.isArray,
              isOptional: propertyTypeDefinition.isOptional,
          }).map((name) => ({
              name,
              message: `must be a ${name}`,
          }))
        : [],
});

/**
 * TODO A factory pattern and polymorphic builders may be cleaner here
 */
export const buildFormFieldForCommandPayloadProp = (
    propertyTypeDefinition: CoscradPropertyTypeDefinition,
    nameLabelAndDescription: NameLabelAndDescription
): IFormField => {
    if (isSimpleCoscradPropertyTypeDefinition(propertyTypeDefinition)) {
        const { coscradDataType, referenceTo, bindToViewProperty } = propertyTypeDefinition;

        if (typeof referenceTo === 'string') {
            if (!isAggregateType(referenceTo)) {
                throw new InternalError(
                    `Command refers to aggregate with invalid type: ${referenceTo}`
                );
            }

            return {
                ...buildSimpleFormField(
                    FormFieldType.dynamicSelect,
                    nameLabelAndDescription,
                    propertyTypeDefinition
                ),
                options: { aggregateType: referenceTo },
            };
        }

        /**
         * In some cases, we use a front-end view as a form element. In that case,
         * we simply want to bind to the view state, which is built up via
         * user interaction.
         */
        if (typeof bindToViewProperty === 'string') {
            const { name, label, description } = nameLabelAndDescription;

            if (bindToViewProperty.length === 0) {
                throw new InternalError(`Cannot bind property ${label} to empty view property`);
            }

            return {
                type: FormFieldType.populatedFromView,
                name,
                label,
                description,
                /**
                 * Populating property values from the model is by design safe
                 * so long as the property naturally aligns with the validation
                 * that will be done. Concretely, if we bind an `inPointMilliseconds`
                 * property to the state of a video's timeline, it will not be possible
                 * to specify a time point that is out of range.
                 */
                constraints: [],
            };
        }

        const lookupResult = lookupTable[coscradDataType];

        if (isNullOrUndefined(lookupResult)) {
            throw new InternalError(
                `Failed to find a form field type for Coscrad data type: ${coscradDataType}`
            );
        }

        return buildSimpleFormField(lookupResult, nameLabelAndDescription, propertyTypeDefinition);
    }

    const { complexDataType } = propertyTypeDefinition;

    if (complexDataType === ComplexCoscradDataType.enum) {
        const { enumLabel, labelsAndValues } =
            propertyTypeDefinition as unknown as EnumTypeDefinition;

        return {
            type: FormFieldType.staticSelect,
            label: enumLabel,
            name: nameLabelAndDescription.name,
            description: nameLabelAndDescription.description,
            /**
             * TODO [https://www.pivotaltracker.com/story/show/184065854]
             * consolidate LabelAndValue with DisplayAndValue.
             */
            options: labelsAndValues.map(({ label, value }) => ({ display: label, value })),
            constraints: [
                {
                    name: 'IS_ENUM',
                    message: 'Must be a valid ${propertyLabel}',
                },
                ...(propertyTypeDefinition.isOptional
                    ? []
                    : [
                          {
                              name: CoscradConstraint.isRequired,
                              message: 'Required',
                          },
                      ]),
            ],
        };
    }

    if (complexDataType === ComplexCoscradDataType.nested) {
        /**
         * Ideally, we will eliminate nested data from command forms. But for now,
         * we will use a JSON editor as a work around.
         */
        return buildSimpleFormField(
            FormFieldType.jsonInput,
            nameLabelAndDescription,
            propertyTypeDefinition
        );
    }

    if (complexDataType === ComplexCoscradDataType.union) {
        return {} as any;
    }

    const exhaustiveCheck: never = complexDataType;

    throw new InternalError(
        `Failed to generate form field for complex data type: ${exhaustiveCheck}`
    );
};
