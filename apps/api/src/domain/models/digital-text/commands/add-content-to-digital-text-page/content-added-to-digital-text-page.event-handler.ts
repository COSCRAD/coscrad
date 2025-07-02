import { Inject } from '@nestjs/common';
import { ContentAddedToDigitalTextPage } from '.';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';

@CoscradEventConsumer('CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE')
export class ContentAddedToDigitalTextPageEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            pageIdentifier,
            text,
            languageCode,
        },
    }: ContentAddedToDigitalTextPage): Promise<void> {
        await this.queryRepository.addContentToPage(id, pageIdentifier, text, languageCode);
    }
}
