import { Photograph } from '../domain/models/photograph/entities/photograph.entity';
import { PartialDTO } from '../types/partial-dto';

const dtos: PartialDTO<Photograph>[] = [
    {
        filename: 'cat.png',
        photographer: 'Susie McRealart',
        dimensions: {
            widthPX: 300,
            heightPX: 400,
        },
    },
    {
        filename: 'dog.png',
        photographer: 'Robert McRealart',
        dimensions: {
            widthPX: 420,
            heightPX: 285,
        },
    },
];

export default (): Photograph[] =>
    dtos.map((dto, index) => new Photograph({ ...dto, id: `${index}` }));
