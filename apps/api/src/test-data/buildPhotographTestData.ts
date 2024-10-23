import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
import { Photograph } from '../domain/models/photograph/entities/photograph.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';
import {
    convertAggregatesIdToUuid,
    convertSequenceNumberToUuid,
} from './utilities/convertSequentialIdToUuid';

const dtos: DTO<Omit<Photograph, 'id' | 'published' | 'isDeleted' | 'type'>>[] = [
    {
        mediaItemId: '5',
        title: buildMultilingualTextWithSingleItem('Adiitsii Running', LanguageCode.English),
        // imageUrl: 'https://coscrad.org/wp-content/uploads/2023/05/Adiitsii-Running.png',
        photographer: 'Susie McRealart',
        dimensions: {
            widthPx: 300,
            heightPx: 400,
        },
    },
    {
        title: buildMultilingualTextWithSingleItem('Nuu Story', LanguageCode.English),
        mediaItemId: '6',
        // imageUrl: 'https://coscrad.org/wp-content/uploads/2023/05/Nuu-Story.png',
        photographer: 'Robert McRealart',
        dimensions: {
            widthPx: 420,
            heightPx: 285,
        },
    },
    {
        title: buildMultilingualTextWithSingleItem('Two Brothers Pole'),
        mediaItemId: '7',
        // imageUrl: 'https://coscrad.org/wp-content/uploads/2023/05/TwoBrothersPole.png',
        photographer: 'Kenny Tree-Huggens',
        dimensions: {
            widthPx: 1200,
            heightPx: 1500,
        },
    },
];

export default (): Photograph[] =>
    dtos
        .map(
            (dto, index) =>
                new Photograph({
                    ...dto,
                    id: `${index}`,
                    published: true,
                    hasBeenDeleted: false,
                    type: ResourceType.photograph,
                    mediaItemId: convertSequenceNumberToUuid(parseInt(dto.mediaItemId)),
                })
        )
        .map(convertAggregatesIdToUuid);
