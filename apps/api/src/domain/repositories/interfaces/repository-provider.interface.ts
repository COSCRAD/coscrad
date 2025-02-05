import { IEventRepositoryProvider } from '../../../persistence/repositories/arango-command-repository-for-aggregate-root';
import { ICategoryRepositoryProvider } from './category-repository-provider.interface';
import { IContributorRepository } from './contributor-repository-provider.interface';
import { IEdgeConnectionRepositoryProvider } from './edge-connection-repository-provider.interface';
import { IResourceRepositoryProvider } from './resource-repository-provider.interface';
import { ITagRepositoryProvider } from './tag-repository-provider.interface';
import { IUserGroupRepositoryProvider } from './user-group-repository-provider.interface';
import { IUserRepositoryProvider } from './user-repository-provider.interface';

/**
 * This abstract-factory (kit) pattern allows us to specify the entire set of
 * repositories that a concrete database implementation (e.g. Arango, in-memory)
 * should satisfy. Note that the downside to this is that in some sense we
 * are coupling all of our sub-domains to one another. It might be better to
 * do away with this and simply expose these providers at the level of
 * each sub-domain's module.
 */
export interface IRepositoryProvider
    extends IResourceRepositoryProvider,
        IEdgeConnectionRepositoryProvider,
        ITagRepositoryProvider,
        ICategoryRepositoryProvider,
        IUserRepositoryProvider,
        IContributorRepository,
        IUserGroupRepositoryProvider,
        IEventRepositoryProvider {}
