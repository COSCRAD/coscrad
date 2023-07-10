import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../../domain/interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../../../domain/repositories/interfaces/repository-provider.interface';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../persistence/constants/persistenceConstants';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { ImportLineItemsToTranscript } from './import-line-items-to-transcript.command';

@CommandHandler(ImportLineItemsToTranscript)
export class ImportLineItemsToTranscriptCommandHandler extends BaseUpdateCommandHandler<ImportLineItemsToTranscript> {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);
    }
}
