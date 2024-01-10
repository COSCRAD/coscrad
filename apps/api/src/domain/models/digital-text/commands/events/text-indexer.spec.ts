import { LanguageCode } from '@coscrad/api-interfaces';
import { Test } from '@nestjs/testing';
import { TestEventStream } from '../../../../../test-data/events/test-event-stream';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { DigitalTextCreated } from './digital-text-created.event';
import {
    CoscradIndex,
    ITextIndexer,
    ITokenizer,
    TextIndexingEventConsumer,
} from './text-indexer.event-handler';

class InMemoryTextIndexer implements ITextIndexer {
    private readonly indexDocuments: CoscradIndex[] = [];

    index(...indexes: CoscradIndex[]): Promise<void> {
        indexes.forEach((index) => this.indexSingle(index));

        return Promise.resolve();
    }

    // this is for POC only. We would probably only expose `search` functionality and then test this from the outside.
    public fetchIndexes(): CoscradIndex[] {
        return this.indexDocuments;
    }

    private indexSingle(index: CoscradIndex) {
        // TODO In reality, we'd need to merge if the token is already known this is just a POC
        this.indexDocuments.push(index);
    }
}

class InMemoryTokenizer implements ITokenizer {
    tokenize(longText: string): string[] {
        return longText
            .split(' ')
            .flatMap(
                // cartoonish only
                (withPunctuation) => withPunctuation.split('.')
            )
            .map((caseDependent) => caseDependent.toLowerCase());
    }
}

const mockIndexer = new InMemoryTextIndexer();

describe(`TextIndexer event consumer`, () => {
    let textIndexingEventConsumer: TextIndexingEventConsumer;

    beforeAll(async () => {
        const testModuleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: 'TEXT_INDEXER_TOKEN',
                    useValue: mockIndexer,
                },
                {
                    provide: 'TOKENIZER_INJECTION_TOKEN',
                    useValue: new InMemoryTokenizer(),
                },
                {
                    provide: DigitalTextCreated,
                    useValue: DigitalTextCreated,
                },
                TextIndexingEventConsumer,
            ],
        }).compile();

        const app = testModuleRef.createNestApplication();

        await app.init();

        textIndexingEventConsumer = app.get(TextIndexingEventConsumer);
    });

    describe(`when indexing text`, () => {
        const languageCode = LanguageCode.English;

        const titleText = 'A big dog runs fast';

        const digitalTextCreated = new TestEventStream().andThen<DigitalTextCreated>({
            type: `DIGITAL_TEXT_CREATED`,
            payload: {
                title: {
                    text: titleText,
                    languageCode,
                },
            },
        });

        it.only(`should work`, async () => {
            await textIndexingEventConsumer.handle(
                digitalTextCreated.as({
                    id: buildDummyUuid(555),
                })[0]
            );

            const updatedIndexes = mockIndexer.fetchIndexes();

            expect(updatedIndexes).not.toEqual([]);

            expect(updatedIndexes).toMatchSnapshot();
        });
    });
});
