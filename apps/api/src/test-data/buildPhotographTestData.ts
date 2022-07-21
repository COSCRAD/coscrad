import { Photograph } from '../domain/models/photograph/entities/photograph.entity';
import { ResourceType } from '../domain/types/ResourceType';

const dtos = [
    {
        filename: 'cat',
        photographer: 'Susie McRealart',
        dimensions: {
            widthPX: 300,
            heightPX: 400,
        },
    },
    {
        filename: 'dog',
        photographer: 'Robert McRealart',
        dimensions: {
            widthPX: 420,
            heightPX: 285,
        },
    },
    {
        filename: 'wildflower',
        photographer: 'Kenny Tree-Huggens',
        dimensions: {
            widthPX: 1200,
            heightPX: 1500,
        },
    },
];

export default (): Photograph[] =>
    dtos.map(
        (dto, index) =>
            new Photograph({
                ...dto,
                id: `${index}`,
                published: true,
                type: ResourceType.photograph,
            })
    );
