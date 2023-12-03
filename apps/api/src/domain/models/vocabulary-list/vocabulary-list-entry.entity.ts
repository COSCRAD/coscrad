import { NonEmptyString } from '@coscrad/data-types';
import { isNullOrUndefined, isObject } from '@coscrad/validation-constraints';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import { AggregateId } from '../../types/AggregateId';
import BaseDomainModel from '../BaseDomainModel';
import { CannotOverwriteFilterPropertyValueForVocabularyListEntryError } from './errors';
import { VocabularyListVariableValue } from './types/vocabulary-list-variable-value';

export class VocabularyListEntry extends BaseDomainModel {
    // TODO Make this a UUID
    @NonEmptyString({
        label: 'term ID',
        description:
            'unique identifier for the term that is included in the vocabulary list via this entry',
    })
    termId: AggregateId;

    // TODO Add type validation rules
    variableValues: Record<string, VocabularyListVariableValue>;

    constructor(dto: DTO<VocabularyListEntry>) {
        super();

        if (!dto) return;

        const { termId, variableValues } = dto;

        this.termId = termId;

        if (isObject(variableValues)) {
            this.variableValues = cloneToPlainObject(variableValues);
        } else {
            this.variableValues = null;
        }
    }

    analyze(
        propertyName: string,
        value: VocabularyListVariableValue
    ): ResultOrError<VocabularyListEntry> {
        const existingValue = this.variableValues[propertyName];

        if (!isNullOrUndefined(existingValue)) {
            return new CannotOverwriteFilterPropertyValueForVocabularyListEntryError(
                propertyName,
                value,
                existingValue
            );
        }

        const updatedVariableValues = {
            ...this.variableValues,
            [propertyName]: value,
        };

        return this.clone<VocabularyListEntry>({
            variableValues: updatedVariableValues,
        });
    }

    doesMatch(propertyName: string, propertyValue: string | boolean): boolean {
        return this.variableValues[propertyName] === propertyValue;
    }
}
