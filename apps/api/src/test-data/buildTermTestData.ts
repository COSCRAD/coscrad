import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextFromBilingualText } from '../domain/common/build-multilingual-text-from-bilingual-text';
import { MultilingualText } from '../domain/common/entities/multilingual-text';
import {
    RESOURCE_READ_ACCESS_GRANTED_TO_USER,
    ResourceReadAccessGrantedToUser,
} from '../domain/models/shared/common-commands';
import { validAggregateOrThrow } from '../domain/models/shared/functional';
import {
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPrompt,
    TermTranslated,
} from '../domain/models/term/commands';
import { PROMPT_TERM_CREATED } from '../domain/models/term/commands/create-prompt-term/constants';
import { TERM_CREATED } from '../domain/models/term/commands/create-term/constants';
import { TERM_ELICITED_FROM_PROMPT } from '../domain/models/term/commands/elicit-term-from-prompt/constants';
import { TERM_TRANSLATED } from '../domain/models/term/commands/translate-term/constants';
import { Term } from '../domain/models/term/entities/term.entity';
import { isNotFound } from '../lib/types/not-found';
import { ResultOrError } from '../types/ResultOrError';
import { TestEventStream } from './events';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const _buildBilingualText = (text: string, textEnglish: string): MultilingualText =>
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

const resourcePublished = {
    type: `RESOURCE_PUBLISHED`,
    payload: {},
};

const iAmSingingEvents = new TestEventStream()
    .andThen<TermCreated>({
        type: TERM_CREATED,
        payload: {
            text: 'I am singing (lang)',
            contributorId: 'Sarah Smith',
            languageCode: LanguageCode.Chilcotin,
        },
    })
    .andThen<TermTranslated>({
        type: TERM_TRANSLATED,
        payload: {
            translation: 'I am singing (Engl)',
            languageCode: LanguageCode.English,
        },
    })
    .andThen(resourcePublished);

//     audioFilename: 'https://coscrad.org/wp-content/uploads/2023/06/512.mp3',
const youAreSingingEvents = new TestEventStream()
    .andThen<TermCreated>({
        type: TERM_CREATED,
        payload: {
            text: 'You are singing (lang)',
            contributorId: 'Sarah Smith',
            languageCode: LanguageCode.Chilcotin,
        },
    })
    .andThen<TermTranslated>({
        type: TERM_TRANSLATED,
        payload: {
            translation: 'You are singing (Engl)',
            languageCode: LanguageCode.English,
        },
    })
    .andThen(resourcePublished);

const sheIsSingingEvents = new TestEventStream()
    .andThen<TermCreated>({
        type: TERM_CREATED,
        payload: {
            text: 'She is singing (lang)',
            contributorId: 'Sarah Smith',
            languageCode: LanguageCode.Chilcotin,
        },
    })
    .andThen<TermTranslated>({
        type: TERM_TRANSLATED,
        payload: {
            translation: 'She is singing (Engl)',
            languageCode: LanguageCode.English,
        },
    })
    .andThen(resourcePublished);

const iAmNotSingingEvents = new TestEventStream()
    .andThen<TermCreated>({
        type: TERM_CREATED,
        payload: {
            text: 'I am not singing (lang)',
            contributorId: 'Sarah Smith',
            languageCode: LanguageCode.Chilcotin,
        },
    })
    .andThen<TermTranslated>({
        type: TERM_TRANSLATED,
        payload: {
            translation: 'I am not singing (Engl)',
            languageCode: LanguageCode.English,
        },
    })
    .andThen(resourcePublished);

// TODO Add some prompt terms
const youAreNotSingingEvents = new TestEventStream()
    .andThen<TermCreated>({
        type: TERM_CREATED,
        payload: {
            text: 'You are not singing (lang)',
            contributorId: 'Sarah Smith',
            languageCode: LanguageCode.Chilcotin,
        },
    })
    .andThen<TermTranslated>({
        type: TERM_TRANSLATED,
        payload: {
            translation: 'You are not singing (Engl)',
            languageCode: LanguageCode.English,
        },
    })
    .andThen(resourcePublished);

const [bilingualTerm1Events, bilingualTerm2Events] = ['1', '2'].map((id) =>
    new TestEventStream()
        .andThen<PromptTermCreated>({
            type: PROMPT_TERM_CREATED,
            payload: {
                text: `Engl-term-${id}`,
                contributorId: 'John Doe',
            },
        })
        .andThen<TermElicitedFromPrompt>({
            type: TERM_ELICITED_FROM_PROMPT,
            payload: {
                text: `Chil-term-${id}`,
                languageCode: LanguageCode.Chilcotin,
            },
        })
        .andThen(resourcePublished)
);

const chilcotinOnlyTermEvents = new TestEventStream().andThen<TermCreated>({
    type: TERM_CREATED,
    payload: {
        text: 'Chil-term-no-english',
        contributorId: 'Jane Deer',
    },
});
// not published

const englishOnlyTermEvents = new TestEventStream()
    .andThen<TermCreated>({
        type: TERM_CREATED,
        payload: {
            text: 'My Secret Term',
            contributorId: 'This prop will be removed soon',
        },
    })
    .andThen<ResourceReadAccessGrantedToUser>({
        type: RESOURCE_READ_ACCESS_GRANTED_TO_USER,
        payload: {
            userId: '1',
        },
    });
// not published

export const buildTermsForVocabularyList = () =>
    [
        Term.fromEventHistory(iAmSingingEvents.as({ id: '511' }), '511'),
        Term.fromEventHistory(youAreSingingEvents.as({ id: '512' }), '512'),
        Term.fromEventHistory(sheIsSingingEvents.as({ id: '513' }), '513'),
        Term.fromEventHistory(iAmNotSingingEvents.as({ id: '501' }), '501'),
        Term.fromEventHistory(youAreNotSingingEvents.as({ id: '502' }), '502'),
        // Missing entry to check partial filtering behaviour
        // {
        //     id: '03',
        //     term: 'She is not singing (lang)',
        //     termEnglish: 'She is not singing (Engl)',
        //     contributorId: 'Sarah Smith',
        // audioFilename: 'https://coscrad.org/wp-content/uploads/2023/06/503.mp3'
        // },
    ]
        .filter((result): result is ResultOrError<Term> => !isNotFound(result))
        .filter(validAggregateOrThrow)
        .map(convertAggregatesIdToUuid);

const buildStandAloneTerms = () =>
    [
        Term.fromEventHistory(bilingualTerm1Events.as({ id: '1' }), '1'),
        Term.fromEventHistory(bilingualTerm2Events.as({ id: '2' }), '2'),
        Term.fromEventHistory(chilcotinOnlyTermEvents.as({ id: '3' }), '3'),
        Term.fromEventHistory(englishOnlyTermEvents.as({ id: '4' }), '4'),
    ]
        .filter((result): result is ResultOrError<Term> => !isNotFound(result))
        .filter(validAggregateOrThrow)
        .map(convertAggregatesIdToUuid);

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): Term[] => [
    // ...[

    // ]
    //     .map((dto) => new Term({ ...dto, type: ResourceType.term, isPromptTerm: false }))
    //     .map(convertAggregatesIdToUuid),
    ...buildStandAloneTerms(),
    ...buildTermsForVocabularyList(),
];
