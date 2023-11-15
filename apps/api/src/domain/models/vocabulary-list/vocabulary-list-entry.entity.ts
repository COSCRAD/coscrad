import { NonEmptyString } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import { AggregateId } from '../../types/AggregateId';
import BaseDomainModel from '../BaseDomainModel';
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

        this.variableValues = isNonEmptyObject(variableValues)
            ? cloneToPlainObject(variableValues)
            : null;
    }

    analyze(
        propertyName: string,
        value: VocabularyListVariableValue
    ): ResultOrError<VocabularyListEntry> {
        const updatedVariableValues = {
            ...this.variableValues,
            [propertyName]: value,
        };

        return this.clone<VocabularyListEntry>({
            variableValues: updatedVariableValues,
        });
    }
}
