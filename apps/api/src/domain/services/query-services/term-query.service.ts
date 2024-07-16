import { Inject, Injectable } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { AccessControlList } from '../../models/shared/access-control/access-control-list.entity';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../models/term/queries';
import { CoscradUserWithGroups } from '../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';

@Injectable()
export class TermQueryService {
    protected readonly type = ResourceType.term;

    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN)
        private readonly termQueryRepository: ITermQueryRepository,
        @Inject(CommandInfoService) _commandInfoService: CommandInfoService
    ) {}

    // todo add explicit return type
    async fetchById(id: AggregateId, userWithGroups?: CoscradUserWithGroups) {
        const result = await this.termQueryRepository.fetchById(id);

        if (isNotFound(result)) return result;

        if (result.isPublished) return result;

        const acl = new AccessControlList(result.accessControlList);

        if (
            acl.canUser(userWithGroups.id) ||
            userWithGroups.groups.some(({ id: groupId }) => acl.canGroup(groupId))
        ) {
            return result;
        }

        return NotFound;
    }

    // TODO should we support specifications \ custom filters?
    async fetchMany(_userWithGroups?: CoscradUserWithGroups) {
        return this.termQueryRepository.fetchMany();
    }
}
