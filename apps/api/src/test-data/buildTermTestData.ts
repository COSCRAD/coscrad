import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
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
import { AggregateId } from '../domain/types/AggregateId';
import { isNotFound } from '../lib/types/not-found';
import { ResultOrError } from '../types/ResultOrError';
import { TestEventStream } from './events';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const buildTermCompositeIdentifier = (id: AggregateId) => ({
    type: AggregateType.term,
    id,
});

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
    (
        [
            [iAmSingingEvents, '511'],
            [youAreSingingEvents, '512'],
            [sheIsSingingEvents, '513'],
            [iAmNotSingingEvents, '501'],
            [youAreNotSingingEvents, '502'],
            // Missing entry to check partial filtering behaviour
            // {
            //     id: '03',
            //     term: 'She is not singing (lang)',
            //     termEnglish: 'She is not singing (Engl)',
            //     contributorId: 'Sarah Smith',
            // audioFilename: 'https://coscrad.org/wp-content/uploads/2023/06/503.mp3'
            // },
        ] as const
    )
        .map(([testEventStream, id]) => testEventStream.as(buildTermCompositeIdentifier(id)))
        .map((eventHistory) =>
            Term.fromEventHistory(
                eventHistory,
                eventHistory[0].payload.aggregateCompositeIdentifier.id
            )
        )
        .filter((result): result is ResultOrError<Term> => !isNotFound(result))
        .filter(validAggregateOrThrow)
        .map(convertAggregatesIdToUuid);

const buildStandAloneTerms = () =>
    (
        [
            [bilingualTerm1Events, '1'],
            [bilingualTerm2Events, '2'],
            [chilcotinOnlyTermEvents, '3'],
            [englishOnlyTermEvents, '4'],
        ] as const
    )
        .map(([testEventStream, id]) => testEventStream.as(buildTermCompositeIdentifier(id)))
        .map((eventHistory) =>
            Term.fromEventHistory(
                eventHistory,
                eventHistory[0].payload.aggregateCompositeIdentifier.id
            )
        )
        .filter((result): result is ResultOrError<Term> => !isNotFound(result))
        .filter(validAggregateOrThrow)
        .map(convertAggregatesIdToUuid);

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): Term[] => {
    const allTerms = [
        // ...[

        // ]
        //     .map((dto) => new Term({ ...dto, type: ResourceType.term, isPromptTerm: false }))
        //     .map(convertAggregatesIdToUuid),
        ...buildStandAloneTerms(),
        ...buildTermsForVocabularyList(),
    ];

    return allTerms;
};
