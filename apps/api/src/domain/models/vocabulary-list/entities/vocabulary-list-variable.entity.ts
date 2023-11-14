import { IVocabularyListVariable } from '@coscrad/api-interfaces';
import { NonEmptyString } from '@coscrad/data-types';
import { isBoolean, isNonEmptyString } from '@coscrad/validation-constraints';
import { ApiProperty } from '@nestjs/swagger';
import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { DropboxOrCheckbox } from '../../vocabulary-list/types/dropbox-or-checkbox';
import { VocabularyListVariableValue } from '../../vocabulary-list/types/vocabulary-list-variable-value';
import { DuplicateValueForVocabularyListFilterPropertyValueError } from '../errors';
import { CheckboxMustHaveExactlyTwoAllowedValuesError } from '../errors/checkbox-must-have-exactly-two-allowed-values.error';
import { DuplicateLabelForVocabularyListFilterPropertyValueError } from '../errors/duplicate-label-for-vocabulary-list-filter-property-value.error';
import { InvalidValueForCheckboxFilterPropertyError } from './invalid-value-for-checkbox-filter-property.error';
import { InvalidValueForSelectFilterPropertyError } from './invalid-value-for-select-filter-property.error';
import { ValueAndDisplay } from './value-and-display.entity';

/**
 * TODO correlate `type` and `validValues`
 * type:dropbox <-> string values
 * type:checkbox <-> boolean values
 */
// TODO Rename this `VocabularyListFilterProperty` or just `FilterProperty`
// Note that this nested entity class is shared with the view layer as well as domain layer
export class VocabularyListFilterProperty<
        TVariableType extends VocabularyListVariableValue = VocabularyListVariableValue
    >
    extends BaseDomainModel
    implements IVocabularyListVariable<TVariableType>
{
    @ApiProperty({
        example: 'person',
        description: 'name of a property that parametrizes terms in the list',
    })
    @NonEmptyString({
        label: 'filter property name',
        description: 'the name of this filter property',
    })
    name: string;

    @ApiProperty({
        example: 'dropbox',
        description:
            'specifies whether the corresponding field be a dropbox (select) or slider (switch)',
    })
    // TODO Support `DropboxOrCheckbox` enum data-type
    type: DropboxOrCheckbox;

    @ApiProperty({
        description: 'specifies the value and label for the corresponding form element',
    })
    // TODO Add data-type decorator and make an actual class for this
    validValues: ValueAndDisplay<TVariableType>[];

    constructor(dto: DTO<VocabularyListFilterProperty>) {
        super();

        if (!dto) return;

        const { name, type, validValues } = dto;

        this.name = name;

        this.type = type;

        this.validValues = Array.isArray(validValues)
            ? validValues.map(cloneToPlainObject)
            : validValues;
    }

    validateComplexInvariants(): InternalError[] {
        /**
         * Here we filter out the duplicated labels.
         */
        const labelCounts = this.validValues.reduce(
            (acc, { display }) =>
                acc.has(display) ? acc.set(display, acc.get(display) + 1) : acc.set(display, 1),
            new Map<string, number>()
        );

        const duplicateLabels = this.validValues.filter(
            ({ display }) => labelCounts.get(display) > 1
        );

        const labelDuplicationErrors = duplicateLabels.map(
            ({ display: label, value }) =>
                new DuplicateLabelForVocabularyListFilterPropertyValueError(this.name, label, value)
        );

        /**
         * Here we filter out the duplicated values.
         */
        const valueCounts = this.validValues.reduce((acc, { value }) => {
            const key = `${value}`;
            return acc.has(key) ? acc.set(key, acc.get(key) + 1) : acc.set(key, 1);
        }, new Map<string, number>());

        const duplicateValues = this.validValues.filter(
            ({ value }) => valueCounts.get(`${value}`) > 1
        );

        const valueDuplicationErrors = duplicateValues.map(
            ({ display: label, value }) =>
                new DuplicateValueForVocabularyListFilterPropertyValueError(this.name, label, value)
        );

        const typeSpecificInvariantErrors = this.validateTypeSpecificInvariants();

        return [
            ...labelDuplicationErrors,
            ...valueDuplicationErrors,
            ...typeSpecificInvariantErrors,
        ];
    }

    /**
     *
     * @returns `InternalError[]` with all errors due to invariant rules that
     * require the `validValues` to be consistent with the filter property's `type`
     */
    private validateTypeSpecificInvariants(): InternalError[] {
        // TODO rename this `VocabularyListFilterPropertyType.select`
        if (this.type === DropboxOrCheckbox.dropbox) {
            const invalidValues = this.validValues.filter(({ value }) => !isNonEmptyString(value));

            return invalidValues.map(
                (invalidValueAndDisplay) =>
                    new InvalidValueForSelectFilterPropertyError(invalidValueAndDisplay, this.name)
            );
        }

        if (this.type === DropboxOrCheckbox.checkbox) {
            const nonBooleanValues = this.validValues.filter(({ value }) => !isBoolean(value));

            const nonBooleanValueErrors = nonBooleanValues.map(
                (invalidValueAndDisplay) =>
                    new InvalidValueForCheckboxFilterPropertyError(
                        invalidValueAndDisplay,
                        this.name
                    )
            );

            // TODO We may want a `ValidValues` class for this.
            const invalidNumberOfValuesErrors =
                this.validValues.length == 2
                    ? []
                    : [
                          new CheckboxMustHaveExactlyTwoAllowedValuesError(
                              this.name,
                              this.validValues
                          ),
                      ];

            return [...nonBooleanValueErrors, ...invalidNumberOfValuesErrors];
        }

        return [
            new InternalError(`Unrecognized vocabulary list filter property type: ${this.type}`),
        ];
    }
}
