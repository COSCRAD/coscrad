import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VocabularyListVariable } from 'apps/api/src/domain/models/vocabulary-list/entities/vocabulary-list-variable.entity';
import { VocabularyListEntry } from 'apps/api/src/domain/models/vocabulary-list/vocabulary-list-entry';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { VocabularyList } from '../../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { VocabularyListVariableValue } from '../../../domain/models/vocabulary-list/types/vocabulary-list-variable-value';
import { EntityId } from '../../../domain/types/EntityId';
import { NotFound } from '../../../lib/types/not-found';
import { TermViewModel } from './term.view-model';

type VariableValues = Record<string, VocabularyListVariableValue>;

class VocabularyListEntryViewModel {
    @ApiProperty({
        type: TermViewModel,
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

export class VocabularyListViewModel {
    @ApiPropertyOptional({
        example: 'Vocabulary List Name (in the language)',
        description: 'name of the vocabulary list, in the language',
    })
    readonly name?: string;

    @ApiPropertyOptional({
        example: 'To pick up <Object>',
        description: 'name of the vocabulary list, in the translation language',
    })
    readonly nameEnglish?: string;

    @ApiProperty({
        example: '3',
        description: 'uniquely identifies the vocabulary list amongst other vocabulary lists',
    })
    readonly id: EntityId;

    @ApiProperty({
        type: VocabularyListEntry,
        isArray: true,
        example: [],
        description:
            'an entry combines a term with a set of "variable values" parametrizing it within the given vocabulary list',
    })
    readonly entries: VocabularyListEntryViewModel[];

    @ApiProperty({
        type: VocabularyListVariable,

        description: 'this property specifies a dynamic form for filtering the entries',
    })
    readonly variables: VocabularyListVariable[];

    readonly #baseAudioURL: string;

    constructor(vocabularyList: VocabularyList, allTerms: Term[], baseAudioURL: string) {
        const { entries, id, name, nameEnglish, variables } = vocabularyList;

        this.#baseAudioURL = baseAudioURL;

        this.id = id;

        this.name = name;

        this.nameEnglish = nameEnglish;

        this.variables = variables;

        const newEntries = (entries || [])
            .map(({ termId, variableValues }) => {
                const termSearchResult = allTerms.find((term) => term.id === termId);

                return {
                    term: termSearchResult
                        ? new TermViewModel(termSearchResult, this.#baseAudioURL)
                        : NotFound,
                    variableValues,
                };
            })
            .filter(({ term }) => term !== NotFound);

        this.entries = newEntries as VocabularyListEntryViewModel[];
    }
}
