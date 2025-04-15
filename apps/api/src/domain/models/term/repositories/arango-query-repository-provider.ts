import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { InternalError } from '../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../lib/types/not-found';
import {
    getArangoViewRepositoryMetadata,
    hasArangoViewRepositoryMetatdata,
} from '../../../../persistence/database/decorators/arango-view-repository.decorator';
import {
    IPublishable,
    IQueryRepositoryProvider,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';

/**
 * TODO We need to find a pattern to make this more extensible. Maybe we should
 * have a decorator that declares the query repository.
 * @CoscradQueryRepository(ResourceType.term).
 * Then we can use reflection to return the desired repository.
 */
export class ArangoQueryRepositoryProvider implements IQueryRepositoryProvider {
    private readonly viewTypeToRepository = new Map<string, unknown>();

    private isInitialized = false;

    //    TODO Use the standard []`Reflector` pattern](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata) from `NestJS`
    constructor(private readonly discoveryService: DiscoveryService) {}

    // can this be `forView(viewtype: string)` ?
    forView<T extends IPublishable>(viewType: string): T {
        if (!this.viewTypeToRepository.has(viewType)) {
            throw new InternalError(
                `Cannot provide a query repository for unknown view type: ${viewType}`
            );
        }

        return this.viewTypeToRepository.get(viewType) as T;
    }

    public async initialize() {
        if (this.isInitialized) {
            return;
        }

        const queryRepositoryProviders = await this.discoveryService.providers((provider) =>
            hasArangoViewRepositoryMetatdata(provider?.injectType)
        );

        for (const provider of queryRepositoryProviders) {
            const meta = getArangoViewRepositoryMetadata(provider.injectType);

            if (isNotFound(meta)) return;

            this.register(meta.viewType, provider.instance);
        }

        this.isInitialized = true;
    }

    private register(viewType: string, repository: unknown) {
        if (!this.viewTypeToRepository.has(viewType)) {
            this.viewTypeToRepository.set(viewType, repository);
        }
    }
}
