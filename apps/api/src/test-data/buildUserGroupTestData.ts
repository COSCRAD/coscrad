import { CoscradUserGroup } from '../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { AggregateType } from '../domain/types/AggregateType';
import { DTO } from '../types/DTO';

const dtos: DTO<CoscradUserGroup>[] = [
    {
        type: AggregateType.userGroup,
        id: '1',
        userIds: ['1'],
        label: 'community members',
        description: 'This group is for members of the community only.',
    },
];

export default (): CoscradUserGroup[] => dtos.map((dto) => new CoscradUserGroup(dto));
