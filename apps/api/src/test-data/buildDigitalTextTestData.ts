import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { buildMultilingualTextFromBilingualText } from '../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { CreateDigitalText, DigitalTextCreated } from '../domain/models/digital-text/commands';
import { DigitalText } from '../domain/models/digital-text/entities/digital-text.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import { isNotFound } from '../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../lib/utilities/clonePlainObjectWithOverrides';
import formatAggregateCompositeIdentifier from '../queries/presentation/formatAggregateCompositeIdentifier';
import { DTO } from '../types/DTO';
import { convertSequenceNumberToUuid } from './utilities/convertSequentialIdToUuid';

const dummyDateNow = 1664237194999;

const digitalTextDtos: DTO<Omit<DigitalText, 'id'>>[] = [
    {
        type: ResourceType.digitalText,
        title: buildMultilingualTextFromBilingualText(
            {
                text: 'Court Case Digital Text title in language',
                languageCode: LanguageCode.Haida,
            },
            {
                text: 'Court Case Digital Text title (English)',
                languageCode: LanguageCode.English,
            }
        ),
        pages: [],
        published: true,
    },
    {
        type: ResourceType.digitalText,
        title: buildMultilingualTextWithSingleItem('Digital Text number two title'),
        pages: [],
        published: false,
        queryAccessControlList: {
            allowedUserIds: ['1'],
            allowedGroupIds: [],
        },
    },
];

const createDigitalTextCommands: CreateDigitalText[] = digitalTextDtos.map(({ title }, index) => ({
    aggregateCompositeIdentifier: {
        type: ResourceType.digitalText,
        id: (index + 1).toString(),
    },
    title: title.items.find(({ role }) => role === MultilingualTextItemRole.original).text,
    languageCodeForTitle: title.items.find(({ role }) => role === MultilingualTextItemRole.original)
        .languageCode,
}));

/**
 * HACK This is a quick and dirty attempt to fit our new event-sourced model
 * into the old snapshot state-based test data creation paradigm. Very soon we
 * will move to event sourcing all resources. At this point, we should abandon
 * the old approach in favor of seeding test data with event or command streams
 * only.
 */
export default (): DigitalText[] =>
    digitalTextDtos.map((_partialDTO, index) => {
        const commandPayload = createDigitalTextCommands[index];

        const digitalTextId = convertSequenceNumberToUuid(index + 1);

        const commandPayloadWithUuid = clonePlainObjectWithOverrides(commandPayload, {
            aggregateCompositeIdentifier: {
                id: digitalTextId,
            },
        });

        const creationEvent = new DigitalTextCreated(
            commandPayloadWithUuid,
            buildDummyUuid(950 + index),
            buildDummyUuid(685),
            dummyDateNow
        );

        const eventHistory = [creationEvent];

        const result = DigitalText.fromEventHistory(eventHistory, digitalTextId);

        if (isInternalError(result)) {
            throw new InternalError(`Failed to build test digital text from event history`, [
                result,
            ]);
        }

        if (isNotFound(result)) {
            throw new InternalError(
                `No creation event for ${formatAggregateCompositeIdentifier({
                    type: AggregateType.digitalText,
                    id: digitalTextId,
                })} was found in the event history: ${eventHistory
                    .map((event) => JSON.stringify(event.toDTO()))
                    .join('\n')}`
            );
        }

        return result;
    });
