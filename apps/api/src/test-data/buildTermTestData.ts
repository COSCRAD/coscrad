import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextFromBilingualText } from '../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../domain/common/entities/multilingual-text';
import { Term } from '../domain/models/term/entities/term.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const buildBilingualText = (text: string, textEnglish: string): MultilingualText =>
    buildMultilingualTextFromBilingualText(
        {
            text,
            languageCode: LanguageCode.Chilcotin,
        },
        {
            text: textEnglish,
            languageCode: LanguageCode.English,
        }
    );

export const buildTermsForVocabularyList = (): Term[] =>
    [
        {
            id: '511',
            term: 'I am singing (lang)',
            termEnglish: 'I am singing (Engl)',
            contributorId: 'Sarah Smith',
            audioFilename: 'https://coscrad.org/wp-content/uploads/2023/06/511.mp3',
        },

        {
            id: '512',
            term: 'You are singing (lang)',
            termEnglish: 'You are singing (Engl)',
            contributorId: 'Sarah Smith',
            audioFilename: 'https://coscrad.org/wp-content/uploads/2023/06/512.mp3',
        },

        {
            id: '513',
            term: 'She is singing (lang)',
            termEnglish: 'She is singing (Engl)',
            contributorId: 'Sarah Smith',
            audioFilename: 'https://coscrad.org/wp-content/uploads/2023/06/513.mp3',
        },

        {
            id: '501',
            term: 'I am not singing (lang)',
            termEnglish: 'I am not singing (Engl)',
            contributorId: 'Sarah Smith',
            audioFilename: 'https://coscrad.org/wp-content/uploads/2023/06/501.mp3',
        },

        {
            id: '502',
            term: 'You are not singing (lang)',
            termEnglish: 'You are not singing (Engl)',
            contributorId: 'Sarah Smith',
            audioFilename: 'https://coscrad.org/wp-content/uploads/2023/06/502.mp3',
        },

        // Missing entry to check partial filtering behaviour
        // {
        //     id: '03',
        //     term: 'She is not singing (lang)',
        //     termEnglish: 'She is not singing (Engl)',
        //     contributorId: 'Sarah Smith',
        // audioFilename: 'https://coscrad.org/wp-content/uploads/2023/06/503.mp3'
        // },
    ]
        .map((partialDto) => ({
            ...partialDto,
            published: true,
            text: buildBilingualText(partialDto.term, partialDto.termEnglish),
            type: ResourceType.term,
        }))
        .map((dto) => new Term(dto))
        .map(convertAggregatesIdToUuid);

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): Term[] => [
    ...[
        {
            text: buildBilingualText('Chil-term-1', 'Engl-term-1'),
            contributorId: 'John Doe',
            id: '1',
            published: true,
        },
        {
            text: buildBilingualText('Chil-term-2', 'Engl-term-2'),
            contributorId: 'John Doe',
            id: '2',
            published: true,
        },
        {
            text: buildMultilingualTextWithSingleItem('Chil-term-no-english', LanguageCode.English),
            term: 'Chil-term-no-english',
            contributorId: 'Jane Deer',
            id: '3',
            published: false,
        },
        {
            text: buildMultilingualTextWithSingleItem('My Secret Term', LanguageCode.English),
            term: 'My Secret Term',
            contributorId: 'This will be removed soon',
            id: '4',
            published: false,
            queryAccessControlList: {
                allowedUserIds: ['1'],
                allowedGroupIds: [],
            },
        },
    ]
        .map((dto) => new Term({ ...dto, type: ResourceType.term }))
        .map(convertAggregatesIdToUuid),
    ...buildTermsForVocabularyList(),
];
