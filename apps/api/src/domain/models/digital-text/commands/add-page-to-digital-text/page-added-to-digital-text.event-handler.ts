import { Inject } from '@nestjs/common';
import { PageAddedToDigitalText } from '..';
import { ICoscradEventHandler } from '../../../../../domain/common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';

export class PageAddedToDigitalTextEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            identifier,
        },
    }: PageAddedToDigitalText): Promise<void> {
        await this.queryRepository.addPage(id, identifier);
    }
}
