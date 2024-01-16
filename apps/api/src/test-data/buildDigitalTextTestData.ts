import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import {
    DigitalTextCreated,
    DigitalTextTitleTranslated,
} from '../domain/models/digital-text/commands';
import { DIGITAL_TEXT_CREATED } from '../domain/models/digital-text/constants';
import { DigitalText } from '../domain/models/digital-text/entities/digital-text.entity';
import { ResourceReadAccessGrantedToUser } from '../domain/models/shared/common-commands';
import { ResourcePublished } from '../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import { isNotFound } from '../lib/types/not-found';
import { TestEventStream } from './events';
import { convertSequenceNumberToUuid } from './utilities/convertSequentialIdToUuid';

const eventHistoryForTextWithBilingualtitle = new TestEventStream()
    .andThen<DigitalTextCreated>({
        type: DIGITAL_TEXT_CREATED,
        payload: {
            title: 'Court Case Digital Text title in language',
            languageCodeForTitle: LanguageCode.Haida,
        },
    })
    .andThen<ResourcePublished>({
        type: `RESOURCE_PUBLISHED`,
    })
    .andThen<DigitalTextTitleTranslated>({
        type: `DIGITAL_TEXT_TITLE_TRANSLATED`,
        payload: {
            translation: 'Court Case Digital Text title (English)',
            languageCode: LanguageCode.English,
        },
    });

const eventHistoryForTextWithUserAccess = new TestEventStream()
    .andThen<DigitalTextCreated>({
        type: `DIGITAL_TEXT_CREATED`,
        payload: {
            title: 'Digital Text number two title',
            languageCodeForTitle: LanguageCode.English,
        },
    })
    .andThen<ResourceReadAccessGrantedToUser>({
        type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
        payload: {
            userId: '1',
        },
    });

/**
 * HACK This is a quick and dirty attempt to fit our new event-sourced model
 * into the old snapshot state-based test data creation paradigm. Very soon we
 * will move to event sourcing all resources. At this point, we should abandon
 * the old approach in favor of seeding test data with event or command streams
 * only.
 */
export default (): DigitalText[] =>
    [eventHistoryForTextWithBilingualtitle, eventHistoryForTextWithUserAccess].map(
        (testEventStream, index) => {
            const id = convertSequenceNumberToUuid(950 + index);

            const events = testEventStream.as({
                id,
                type: AggregateType.digitalText,
            });

            const buildResult = DigitalText.fromEventHistory(events, id);

            if (isInternalError(buildResult)) {
                throw new InternalError(
                    `Failed to build test data for digital texts from events: ${buildResult}`
                );
            }

            if (isNotFound(buildResult)) {
                throw new InternalError(
                    `Failed to build test data for digital text due to missing creation event in history: ${JSON.stringify(
                        testEventStream
                    )}`
                );
            }

            return buildResult;
        }
    );
