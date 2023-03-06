import { LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { Playlist } from '../domain/models/playlist';
import { DTO } from '../types/DTO';
import { buildSingleLanguageText } from './buildAudioItemTestData';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const partialDtos: Omit<DTO<Playlist>, 'type'>[] = [
    {
        id: '501',
        name: buildSingleLanguageText("Blake's jams", LanguageCode.Chilcotin),
        items: [],
        published: true,
    },
];

export default () =>
    partialDtos
        .map((partialDto) => new Playlist({ ...partialDto, type: ResourceType.playlist }))
        .map(convertAggregatesIdToUuid);
