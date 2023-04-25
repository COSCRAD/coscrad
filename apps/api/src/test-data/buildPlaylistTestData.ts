import { LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { Playlist } from '../domain/models/playlist';
import { AggregateId } from '../domain/types/AggregateId';
import { DTO } from '../types/DTO';
import buildAudioItemTestData, { buildSingleLanguageText } from './buildAudioItemTestData';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const audioItems = buildAudioItemTestData();

const partialDtos: Omit<DTO<Playlist>, 'type'>[] = [
    {
        id: '501',
        name: buildSingleLanguageText("Blake's jams", LanguageCode.Chilcotin),
        items: [
            {
                resourceCompositeIdentifier: audioItems[0].getCompositeIdentifier() as {
                    type: typeof ResourceType.audioItem;
                    id: AggregateId;
                },
            },
            {
                resourceCompositeIdentifier: audioItems[1].getCompositeIdentifier() as {
                    type: typeof ResourceType.audioItem;
                    id: AggregateId;
                },
            },
        ],
        published: true,
    },
];

export default () =>
    partialDtos
        .map((partialDto) => new Playlist({ ...partialDto, type: ResourceType.playlist }))
        .map(convertAggregatesIdToUuid);
