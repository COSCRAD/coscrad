import {
    DropboxOrCheckbox,
    FormFieldType,
    IDynamicForm,
    IFormField,
    IVocabularyListEntry,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { VocabularyListVariable } from '../../../domain/models/vocabulary-list/entities/vocabulary-list-variable.entity';
import { VocabularyList } from '../../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { VocabularyListVariableValue } from '../../../domain/models/vocabulary-list/types/vocabulary-list-variable-value';
import { VocabularyListEntry } from '../../../domain/models/vocabulary-list/vocabulary-list-entry.entity';
import { NotFound } from '../../../lib/types/not-found';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from './base.view-model';
import { TermViewModel } from './term.view-model';

type VariableValues = Record<string, VocabularyListVariableValue>;

class VocabularyListEntryViewModel implements IVocabularyListEntry<VocabularyListVariableValue> {
    @ApiProperty({
        type: TermViewModel,
    })
    @NestedDataType(TermViewModel, {
        label: 'term',
        description: 'the term that is included in the vocabulary list via this entry',
    })
    term: TermViewModel;

    @ApiProperty({
        example: {
            person: '11',
            positive: false,
            usitative: false,
            aspect: '4',
        },
        description:
            'an object that specifies the value of all parameters used to search for the term in the vocabulary list',
    })
    variableValues: VariableValues;
}

const convertVocabularyListVaraibleToFormElement = ({
    type: variableType,
    name,
    validValues,
}: VocabularyListVariable): IFormField => ({
    type:
        variableType === DropboxOrCheckbox.checkbox
            ? FormFieldType.switch
            : FormFieldType.staticSelect,
    name,
    label: name, // do we need a separate label?
    description: `choose ${name}`,
    options: cloneToPlainObject(validValues),
    /**
     * Invalid input isn't possible for static select and switch components.
     */
    constraints: [],
});

export class VocabularyListViewModel extends BaseViewModel implements IVocabularyListViewModel {
    // @ApiPropertyOptional({
    //     example: 'Vocabulary List Name (in the language)',
    //     description: 'name of the vocabulary list, in the language',
    // })
    // @FromVocabularyList
    // readonly name?: string;

    // @ApiPropertyOptional({
    //     example: 'To pick up <Object>',
    //     description: 'name of the vocabulary list, in the translation language',
    // })
    // @FromVocabularyList
    // readonly nameEnglish?: string;

    readonly name: MultilingualText;

    @ApiProperty({
        type: VocabularyListEntry,
        isArray: true,
        example: [],
        description:
            'an entry combines a term with a set of "variable values" parametrizing it within the given vocabulary list',
    })
    @NestedDataType(VocabularyListEntryViewModel, {
        isArray: true,
        label: 'entries',
        description: 'all terms in this vocabulary list together with their filter properties',
    })
    readonly entries: VocabularyListEntryViewModel[];

    // @ApiProperty({
    //     type: VocabularyListVariable,

    //     description: 'this property specifies a dynamic form for filtering the entries',
    // })
    readonly form: IDynamicForm;

    constructor(vocabularyList: VocabularyList, allTerms: Term[]) {
        super(vocabularyList);

        const { entries, variables } = vocabularyList;

        this.form = {
            fields: variables.map(convertVocabularyListVaraibleToFormElement),
        };

        const newEntries = (entries || [])
            .map(({ termId, variableValues }) => {
                const termSearchResult = allTerms.find((term) => term.id === termId);

                return {
                    term: termSearchResult ? new TermViewModel(termSearchResult) : NotFound,
                    variableValues,
                };
            })
            .filter(({ term }) => term !== NotFound);

        this.entries = newEntries as VocabularyListEntryViewModel[];
    }
}
