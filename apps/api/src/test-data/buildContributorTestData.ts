import { CoscradContributor } from '../domain/models/user-management/contributor/entities/coscrad-contributor.entity';
import { FullName } from '../domain/models/user-management/user/entities/user/full-name.entity';
import { AggregateType } from '../domain/types/AggregateType';
import { DTO } from '../types/DTO';
import { convertAggregatesIdToUuid } from './utilities/convertSequentialIdToUuid';

const dtos: DTO<CoscradContributor>[] = [
    {
        type: AggregateType.contributor,
        id: '901',
        fullName: new FullName({
            firstName: 'Dummy',
            lastName: 'Contributor',
        }).toDTO(),
        shortBio: 'I am a test contributor for COSCRAD.',
    },
];

export default (): CoscradContributor[] =>
    dtos.map((dto) => new CoscradContributor(dto)).map(convertAggregatesIdToUuid);
