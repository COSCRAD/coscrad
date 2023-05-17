import { Photograph } from '../domain/models/photograph/entities/photograph.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { DTO } from '../types/DTO';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const dtos: DTO<Omit<Photograph, 'id' | 'published' | 'type'>>[] = [
    {
        imageUrl: 'https://kaaltsidakah.net/coscrad/Adiitsii-Running.png',
        photographer: 'Susie McRealart',
        dimensions: {
            widthPX: 300,
            heightPX: 400,
        },
    },
    {
        imageUrl: 'https://kaaltsidakah.net/coscrad/Nuu-Story.png',
        photographer: 'Robert McRealart',
        dimensions: {
            widthPX: 420,
            heightPX: 285,
        },
    },
    {
        imageUrl: 'https://kaaltsidakah.net/coscrad/TwoBrothersPole.png',
        photographer: 'Kenny Tree-Huggens',
        dimensions: {
            widthPX: 1200,
            heightPX: 1500,
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
                    type: ResourceType.photograph,
                })
        )
        .map(convertAggregatesIdToUuid);
