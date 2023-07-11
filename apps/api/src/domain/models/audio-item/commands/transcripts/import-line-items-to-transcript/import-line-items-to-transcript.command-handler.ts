import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../../domain/interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../../../domain/repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../domain/types/ResourceType';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Resource } from '../../../../resource.entity';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { ITranscribable } from '../../../entities/transcribable.mixin';
import { ImportLineItemsToTranscript } from './import-line-items-to-transcript.command';

type TranscribableResource = ITranscribable & Resource;
@CommandHandler(ImportLineItemsToTranscript)
export class ImportLineItemsToTranscriptCommandHandler extends BaseUpdateCommandHandler<ImportLineItemsToTranscript> {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);
    }

    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return new Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected createOrFetchWriteContext({
        aggregateCompositeIdentifier,
    }: ImportLineItemsToTranscript): Promise<ResultOrError<ImportLineItemsToTranscript>> {
        const {};
    }
}
