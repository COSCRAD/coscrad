import { LanguageCode, MultilingualTextItemRole, PaginatedResponse } from '@coscrad/api-interfaces';
import {
    bootstrapDynamicTypes,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
} from '@coscrad/data-types';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../app/config/buildConfigFilePath';
import { Environment } from '../../../app/config/constants/environment';
import buildMockConfigService from '../../../app/config/__tests__/utilities/buildMockConfigService';
import { MultilingualTextItem } from '../../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../domain/models/__tests__/utilities/dummyDateNow';
import { dummySystemUserId } from '../../../domain/models/__tests__/utilities/dummySystemUserId';
import { MultilingualTextField } from '../../../lib/nlp/multilingual-text';
import { PersistenceModule } from '../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { CoscradNLPModule } from '../coscrad-natural-language-processing.module';
import { ArangoFullTextSearchQueryRepository } from './arango-full-text-search-query-repository';
import { FullTextSearchRecord } from './full-text-result-record.dto';
import { FullTextSearchIndexer } from './full-text-search-indexer.event-handler';
import { FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN } from './full-text-search-query.interface';

const WIDGET = 'widget';

class WidgetCompositeIdentifier {
    @NonEmptyString({
        label: 'type',
        description: `always "${WIDGET}"`,
    })
    type = WIDGET;

    @NonEmptyString({
        label: 'ID',
        description: 'system identifier',
    })
    id: string;
}

class EventWithMlTextPayload {
    @NestedDataType(WidgetCompositeIdentifier, {
        label: 'composite ID',
        description: 'system wide unique identifier for this widget',
    })
    aggregateCompositeIdentifier: WidgetCompositeIdentifier;

    @NonNegativeFiniteNumber({
        label: 'count',
        description: 'test prop: count',
    })
    count: number;

    @MultilingualTextField()
    @NestedDataType(MultilingualTextItem, {
        label: 'description',
        description: 'test prop: description',
    })
    description: MultilingualTextItem;

    @MultilingualTextField()
    @NestedDataType(MultilingualTextItem, {
        label: 'nickname',
        description: 'test prop: nickname',
    })
    nickname: MultilingualTextItem;

    constructor({
        aggregateCompositeIdentifier,
        count,
        description,
        nickname,
    }: {
        aggregateCompositeIdentifier: WidgetCompositeIdentifier;
        count: number;
        description: MultilingualTextItem;
        nickname: MultilingualTextItem;
    }) {
        this.aggregateCompositeIdentifier = aggregateCompositeIdentifier;

        this.count = count;

        this.description = description;

        this.nickname = nickname;
    }
}

class EventWithMlText {
    @NonEmptyString({
        label: 'type',
        description: 'distinguishes all events of the same type',
    })
    readonly type = 'EVENT_WITH_ML_TEXT_HAPPENED';

    @NestedDataType(EventWithMlTextPayload, {
        label: 'payload',
        description: 'data for this event',
    })
    payload: EventWithMlTextPayload;

    meta: Record<string, unknown>;

    constructor(payload: EventWithMlTextPayload, meta: Record<string, unknown>) {
        this.payload = new EventWithMlTextPayload(payload);

        this.meta = meta;
    }

    isOfType(t: string) {
        return t === 'EVENT_WITH_ML_TEXT_HAPPENED';
    }

    // TODO put some real logic here
    isFor(): boolean {
        return true;
    }
}

/**
 * Note that we want this test to be completely decoupled from any concrete
 * resource types \ events. This will eventually be part of a separate library.
 */
describe('FullTextSearchIndexer', () => {
    let handler: FullTextSearchIndexer;

    let testRepository: ArangoFullTextSearchQueryRepository;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), CoscradNLPModule],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        const app = testModule.createNestApplication();

        await app.init();

        handler = app.get(FullTextSearchIndexer);

        testRepository = app.get(FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN);

        bootstrapDynamicTypes([WidgetCompositeIdentifier, EventWithMlTextPayload, EventWithMlText]);
    });

    describe(`when the event has multilingual text`, () => {
        const aggregateCompositeIdentifier = {
            type: WIDGET,
            id: buildDummyUuid(2),
        } as const;

        const targetLangaugeCode = LanguageCode.Chilcotin;

        const targetLetter = 'l';

        const textToIndex = `de${targetLetter}el`;

        const eventWithMlText = new EventWithMlText(
            {
                aggregateCompositeIdentifier,
                count: 5,
                description: new MultilingualTextItem({
                    text: textToIndex,
                    languageCode: targetLangaugeCode,
                    role: MultilingualTextItemRole.original,
                }),
                nickname: new MultilingualTextItem({
                    text: 'nickname text',
                    languageCode: targetLangaugeCode,
                    role: MultilingualTextItemRole.original,
                }),
            },
            {
                id: buildDummyUuid(1),
                userId: dummySystemUserId,
                dateCreated: dummyDateNow,
            }
        );

        it(`should index the corresponding document`, async () => {
            await handler.handle(eventWithMlText);

            const searchResult = (await testRepository.findByLetter(
                targetLetter
            )) as PaginatedResponse<FullTextSearchRecord>;

            expect(searchResult.entities).toHaveLength(1);
        });
    });
});
