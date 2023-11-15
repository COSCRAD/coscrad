import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { DropboxOrCheckbox } from '../types/dropbox-or-checkbox';
import { VocabularyListEntry } from '../vocabulary-list-entry.entity';
import { VocabularyListFilterProperty } from './vocabulary-list-variable.entity';
import { VocabularyList } from './vocabulary-list.entity';

const validValueForCheckBox = true;

const existingCheckBoxFilterProperty: VocabularyListFilterProperty<boolean> =
    new VocabularyListFilterProperty({
        name: 'positive',
        type: DropboxOrCheckbox.checkbox,
        validValues: [
            { value: validValueForCheckBox, display: 'positive' },
            {
                value: !validValueForCheckBox,
                display: 'negative',
            },
        ],
    });

const existingEntry = new VocabularyListEntry({
    termId: buildDummyUuid(55),
    variableValues: {},
});

describe('VocabularyList.analyzeEntry', () => {
    describe('when the analysis is valid', () => {
        it('should return a new vocabulary list with the analysis applied', () => {
            const existingVocabularyList = getValidAggregateInstanceForTest(
                AggregateType.vocabularyList
            ).clone({
                variables: [existingCheckBoxFilterProperty],
                entries: [existingEntry],
            });

            const result = existingVocabularyList.analyzeEntry(
                existingEntry.termId,
                existingCheckBoxFilterProperty.name,
                validValueForCheckBox
            );

            expect(result).toBeInstanceOf(VocabularyList);
        });
    });
});
