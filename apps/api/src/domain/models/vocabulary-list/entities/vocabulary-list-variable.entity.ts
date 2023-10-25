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
        // TODO rename this `VocabularyListFilterPropertyType.select`
        if (this.type === DropboxOrCheckbox.dropbox) {
            const invalidValues = this.validValues.filter(({ value }) => !isNonEmptyString(value));

            return invalidValues.map(
                (invalidValueAndDisplay) =>
                    new InvalidValueForSelectFilterPropertyError(invalidValueAndDisplay, this.name)
            );
        }

        if (this.type === DropboxOrCheckbox.checkbox) {
            const invalidValues = this.validValues.filter(({ value }) => !isBoolean(value));

            return invalidValues.map(
                (invalidValueAndDisplay) =>
                    new InvalidValueForCheckboxFilterPropertyError(
                        invalidValueAndDisplay,
                        this.name
                    )
            );
        }

        return [
            new InternalError(`Unrecognized vocabulary list filter property type: ${this.type}`),
        ];
    }
}
