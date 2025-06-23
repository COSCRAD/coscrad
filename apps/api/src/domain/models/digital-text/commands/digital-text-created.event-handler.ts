import { Inject } from '@nestjs/common';
import { DigitalTextViewModel } from '../../../../queries/digital-text';
import { ICoscradEventHandler } from '../../../common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../queries/digital-text-query-repository.interface';
import { DigitalTextCreated } from './digital-text-created.event';

export class DigitalTextCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly digitalTextQueryRepository: IDigitalTextQueryRepository
    ) {}

    async handle(event: DigitalTextCreated): Promise<void> {
        const view = DigitalTextViewModel.fromDigitalTextCreated(event);

        await this.digitalTextQueryRepository.create(view);
    }
}
