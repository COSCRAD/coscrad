import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { ExternalEnum, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { VocabularyListCompositeId } from '../create-vocabulary-list';
import { REGISTER_VOCABULARY_LIST_FILTER_PROPERTY } from './constants';

export enum FilterPropertyType {
    selection = `selection`,
    checkbox = `checkbox`,
}

class ValueAndLabel<T> {
    @NonEmptyString({
        label: `label`,
        description: `the label the user will see when using this filter`,
    })
    readonly label: string;

    // TODO this should be either boolean or NonEmptyString
    readonly value: T;
}

@Command({
    type: REGISTER_VOCABULARY_LIST_FILTER_PROPERTY,
    label: 'Register Vocabulary List Filter Property',
    description: 'Register a Vocabulary List Filter Property',
})
export class RegisterVocabularyListFilterProperty implements ICommandBase {
    @NestedDataType(VocabularyListCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unqiue identifier',
    })
    readonly aggregateCompositeIdentifier: VocabularyListCompositeId;

    @NonEmptyString({
        label: 'name',
        description: 'name of the vocabulary list',
    })
    readonly name: string;

    @ExternalEnum(
        {
            enumName: `FilterPropertyType`,
            enumLabel: `filter property type`,
            labelsAndValues: [
                {
                    label: `selection (pick one of several text values)`,
                    value: FilterPropertyType.selection,
                },
                {
                    label: `checkbox (either true or false)`,
                    value: FilterPropertyType.checkbox,
                },
            ],
        },
        {
            label: `filter property type`,
            description: `either a selection or a switch (true / false)`,
        }
    )
    readonly type: FilterPropertyType;

    @NestedDataType(ValueAndLabel, {
        isArray: true,
        isOptional: false,
        label: `allowed values and labels`,
        description: `set of all valid values allowed for this filter property`,
    })
    readonly allowedValuesAndLabels: ValueAndLabel<string | boolean>[];
}
