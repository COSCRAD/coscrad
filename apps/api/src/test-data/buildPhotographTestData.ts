import { LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { PhotographCreated } from '../domain/models/photograph';
import { Photograph } from '../domain/models/photograph/entities/photograph.entity';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import { isNotFound } from '../lib/types/not-found';
import { TestEventStream } from './events';

const testEventStream = new TestEventStream();

const creationEvents = [
    testEventStream.buildSingle<PhotographCreated>({
        type: 'PHOTOGRAPH_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(10000),
            },
            mediaItemId: buildDummyUuid(10005),
            title: 'Adiitsii Running',
            languageCodeForTitle: LanguageCode.English,
            photographer: 'Susie McRealart',
            // dimensions: {
            //     widthPx: 300,
            //     heightPx: 400,
            // },
        },
    }),
    testEventStream.buildSingle<PhotographCreated>({
        type: 'PHOTOGRAPH_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(10001),
            },
            mediaItemId: buildDummyUuid(10006),
            title: 'Nuu Story',
            languageCodeForTitle: LanguageCode.English,
            photographer: 'Robert McRealart',
            // dimensions: {
            //     widthPx: 420,
            //     heightPx: 285,
            // },
        },
    }),
    testEventStream.buildSingle<PhotographCreated>({
        type: 'PHOTOGRAPH_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(10002),
            },
            mediaItemId: buildDummyUuid(10007),
            title: 'Two Brothers Pole',
            languageCodeForTitle: LanguageCode.English,
            photographer: 'Kenny Tree-Huggens',
            // dimensions: {
            //     widthPx: 1200,
            //     heightPx: 1500,
            // },
        },
    }),
];

export default (): Photograph[] =>
    creationEvents.map((event) => {
        const photo = Photograph.fromEventHistory(
            [event],
            event.payload.aggregateCompositeIdentifier.id
        );

        if (isInternalError(photo) || isNotFound(photo)) {
            throw new InternalError(`Encountered invalid photograph test data`);
        }

        return photo;
    });
