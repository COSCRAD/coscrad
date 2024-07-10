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
import { AudioItem } from '../../../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { CoscradContributor } from '../../../domain/models/user-management/contributor';
import { VocabularyListFilterProperty } from '../../../domain/models/vocabulary-list/entities/vocabulary-list-variable.entity';
import { VocabularyList } from '../../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { VocabularyListVariableValue } from '../../../domain/models/vocabulary-list/types/vocabulary-list-variable-value';
import { VocabularyListEntry } from '../../../domain/models/vocabulary-list/vocabulary-list-entry.entity';
import { NotFound } from '../../../lib/types/not-found';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { BaseResourceViewModel } from './base-resource.view-model';
import { TermViewModel } from './term.view-model.state-based';

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
}: VocabularyListFilterProperty): IFormField => ({
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

export class VocabularyListViewModel
    extends BaseResourceViewModel
    implements IVocabularyListViewModel
{
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

    constructor(
        vocabularyList: VocabularyList,
        allTerms: Term[],
        allAudioItems: AudioItem[],
        allMediaItems: MediaItem[],
        contributors: CoscradContributor[]
    ) {
        super(vocabularyList, contributors);

        const { entries, variables } = vocabularyList;

        this.form = {
            fields: variables.map(convertVocabularyListVaraibleToFormElement),
        };

        /**
         * TODO We need to optimize the performance of this. We haven't prioritized
         * this because we are moving towards eagerly calculating materialized views
         * via event sourcing.
         */
        const newEntries = (entries || [])
            .map(({ termId, variableValues }) => {
                const termSearchResult = allTerms.find((term) => term.id === termId);

                return {
                    term: termSearchResult
                        ? new TermViewModel(
                              termSearchResult,
                              allAudioItems,
                              allMediaItems,
                              contributors
                          )
                        : NotFound,
                    variableValues,
                };
            })
            .filter(({ term }) => term !== NotFound);

        this.entries = newEntries as VocabularyListEntryViewModel[];
    }
}
