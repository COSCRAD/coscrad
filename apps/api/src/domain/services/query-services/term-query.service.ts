import { Inject, Injectable } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
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
    async fetchById(id: AggregateId, _userWithGroups?: CoscradUserWithGroups) {
        const result = await this.termQueryRepository.fetchById(id);
    }

    // TODO should we support specifications \ custom filters?
    async fetchMany(_userWithGroups?: CoscradUserWithGroups) {
        return this.termQueryRepository.fetchMany();
    }
}
