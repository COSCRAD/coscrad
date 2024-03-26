import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { CoscradContributor } from '../../models/user-management/contributor/entities/coscrad-contributor.entity';
import { IRepositoryForAggregate } from '../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';

export class CoscradContributorQueryService {
    private readonly coscradContributorRepository: IRepositoryForAggregate<CoscradContributor>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {
        this.coscradContributorRepository = repositoryProvider.getContributorRepository();
    }
}
