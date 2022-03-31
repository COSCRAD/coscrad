import { ConfigService } from '@nestjs/config';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';

export type ViewModelBuilderDependencies = {
    repositoryProvider: RepositoryProvider;
    configService: ConfigService;
};
