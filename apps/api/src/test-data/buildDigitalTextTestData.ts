import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { buildMultilingualTextFromBilingualText } from '../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { CreateDigitalText, DigitalTextCreated } from '../domain/models/digital-text/commands';
import { DigitalText } from '../domain/models/digital-text/digital-text.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { clonePlainObjectWithOverrides } from '../lib/utilities/clonePlainObjectWithOverrides';
import { DTO } from '../types/DTO';
import {
    convertAggregatesIdToUuid,
    convertSequenceNumberToUuid,
} from './utilities/convertSequentialIdToUuid';

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

export default (): DigitalText[] =>
    digitalTextDtos
        .map((partialDTO, index) => {
            const commandPayload = createDigitalTextCommands[index];

            const commandPayloadWithUuid = clonePlainObjectWithOverrides(commandPayload, {
                aggregateCompositeIdentifier: {
                    id: convertSequenceNumberToUuid(
                        parseInt(commandPayload.aggregateCompositeIdentifier.id)
                    ),
                },
            });

            const creationEvent = new DigitalTextCreated(
                commandPayloadWithUuid,
                buildDummyUuid(950 + index),
                buildDummyUuid(685),
                dummyDateNow
            );

            return new DigitalText({
                ...partialDTO,
                id: `${index + 1}`,
                type: ResourceType.digitalText,
                eventHistory: [creationEvent],
            });
        })
        .map(convertAggregatesIdToUuid);
