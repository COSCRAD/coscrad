import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NotFound } from '../../../../lib/types/not-found';
import { TestEventStream } from '../../../../test-data/events';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { PhotographCreated } from '../commands';
import { Photograph } from './photograph.entity';

const photographId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.photograph,
    id: photographId,
};

const mediaItemId = buildDummyUuid(2);

const photographer = 'Jane Buck';

const photographWidth = 120;

const photographHeight = 300;

const photographTitle = 'A Good Drawing';

const originalLanguageCodeForTitle = LanguageCode.English;

const photographCreated = new TestEventStream().andThen<PhotographCreated>({
    type: 'PHOTOGRAPH_CREATED',
    payload: {
        mediaItemId,
        photographer,
        widthPx: photographWidth,
        heightPx: photographHeight,
        title: photographTitle,
        languageCodeForTitle: originalLanguageCodeForTitle,
    },
});

describe(`Photograph.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when the photograph has first been created`, () => {
            it(`should return a photograph with the correct state`, () => {
                const result = Photograph.fromEventHistory(
                    photographCreated.as(aggregateCompositeIdentifier),
                    photographId
                );

                expect(result).toBeInstanceOf(Photograph);

                const photograph = result as Photograph;

                expect(photograph.id).toBe(photographId);

                expect(photograph.photographer).toBe(photographer);

                expect(photograph.mediaItemId).toBe(mediaItemId);

                const {
                    dimensions: { widthPx, heightPx },
                } = photograph;

                expect(widthPx).toBe(photographWidth);

                expect(heightPx).toBe(photographHeight);

                const { text: foundText, languageCode: foundLanguageCode } =
                    photograph.title.getOriginalTextItem();

                expect(foundText).toBe(photographTitle);

                expect(foundLanguageCode).toBe(originalLanguageCodeForTitle);
            });
        });
    });

    describe(`when the event history is invalid`, () => {
        describe(`when there are no events for the given photograph`, () => {
            it(`should return not found`, () => {
                const result = Photograph.fromEventHistory(
                    photographCreated.as({
                        type: AggregateType.photograph,
                        id: buildDummyUuid(765),
                    }),
                    photographId
                );

                expect(result).toBe(NotFound);
            });
        });

        // Add this case once we have an update event for `Photographs`
        describe(`when there is no creation event`, () => {
            it.todo('should throw');
        });

        describe(`when there is invalid data for the creation event`, () => {
            it(`should throw`, () => {
                const eventSource = () =>
                    Photograph.fromEventHistory(
                        new TestEventStream()
                            .andThen<PhotographCreated>({
                                type: 'PHOTOGRAPH_CREATED',
                                payload: {
                                    languageCodeForTitle: 'XYz22' as LanguageCode,
                                },
                            })
                            .as(aggregateCompositeIdentifier),
                        photographId
                    );

                expect(eventSource).toThrow();
            });
        });
    });
});
