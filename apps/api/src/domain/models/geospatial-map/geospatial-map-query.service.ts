import {
    ICommandFormAndLabels,
    IGeospatialMapViewModel,
    IIndexQueryResult,
} from '@coscrad/api-interfaces';
import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import {
    CommandContext,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { UserQueryOptions } from '../../../app/controllers/resources/term.controller';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { fetchActionsForUser } from '../../services/query-services/utilities/fetch-actions-for-user';
import { AggregateId } from '../../types/AggregateId';
import { ResourceType } from '../../types/ResourceType';
import { CoscradUserWithGroups } from '../user-management/user/entities/user/coscrad-user-with-groups';
import {
    GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN,
    IGeospatialMapQueryRepository,
} from './repositories/geospatial-map-query-repository.interface';

@Injectable()
export class GeospatialMapQueryService {
    protected readonly type = ResourceType.map;

    constructor(
        @Inject(GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN)
        private readonly geospatialMapQueryRepo: IGeospatialMapQueryRepository,
        @Inject(CommandInfoService) private readonly commandInfoService: CommandInfoService
    ) {}

    async fetchById(
        id: AggregateId,
        userWithGroups?: CoscradUserWithGroups
    ): Promise<Maybe<IGeospatialMapViewModel>> {
        const result = await this.geospatialMapQueryRepo.fetchById(id, userWithGroups);

        if (isNotFound(result)) return NotFound;

        const transformed = result as unknown as IGeospatialMapViewModel;

        transformed.actions = this.fetchUserActions(userWithGroups, [result]);

        return transformed;
    }

    async fetchMany(
        _userWithGroups?: CoscradUserWithGroups,
        _options?: UserQueryOptions
    ): Promise<IIndexQueryResult<IGeospatialMapViewModel>> {
        throw new NotImplementedException();
    }

    private fetchUserActions(
        systemUser: CoscradUserWithGroups,
        commandContexts: CommandContext[]
    ): ICommandFormAndLabels[] {
        return commandContexts.flatMap((commandContext) =>
            fetchActionsForUser(this.commandInfoService, systemUser, commandContext)
        );
    }
}
