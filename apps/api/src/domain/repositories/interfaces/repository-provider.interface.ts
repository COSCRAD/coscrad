import { IEventRepositoryProvider } from '../../../persistence/repositories/arango-command-repository-for-aggregate-root';
import { ICategoryRepositoryProvider } from './category-repository-provider.interface';
import { IContributorRepository } from './contributor-repository-provider.interface';
import { IEdgeConnectionRepositoryProvider } from './edge-connection-repository-provider.interface';
import { IResourceRepositoryProvider } from './resource-repository-provider.interface';
import { ITagRepositoryProvider } from './tag-repository-provider.interface';
import { IUserGroupRepositoryProvider } from './user-group-repository-provider.interface';
import { IUserRepositoryProvider } from './user-repository-provider.interface';

export interface IRepositoryProvider
    extends IResourceRepositoryProvider,
        IEdgeConnectionRepositoryProvider,
        ITagRepositoryProvider,
        ICategoryRepositoryProvider,
        IUserRepositoryProvider,
        IContributorRepository,
        IUserGroupRepositoryProvider,
        IEventRepositoryProvider {}
