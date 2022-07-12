import { ICategoryRepositoryProvider } from './category-repository-provider.interface';
import { IEdgeConnectionRepositoryProvider } from './edge-connection-repository-provider.interface';
import { IIdRepositoryProvider } from './id-repository-provider.interface';
import { IResourceRepositoryProvider } from './resource-repository-provider.interface';
import { ITagRepositoryProvider } from './tag-repository-provider.interface';
import { IUserGroupRepositoryProvider } from './user-group-repository-provider.interface';
import { IUserRepositoryProvider } from './user-repository-provider.interface';

export interface IRepositoryProvider
    extends IResourceRepositoryProvider,
        IEdgeConnectionRepositoryProvider,
        ITagRepositoryProvider,
        ICategoryRepositoryProvider,
        IIdRepositoryProvider,
        IUserRepositoryProvider,
        IUserGroupRepositoryProvider {}
