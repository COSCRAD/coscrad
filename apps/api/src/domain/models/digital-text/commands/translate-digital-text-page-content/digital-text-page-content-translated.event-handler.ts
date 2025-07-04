import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { DigitalTextPageContentTranslated } from './digital-text-page-content-translated.event';

@CoscradEventConsumer('DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED')
export class DigitalTextPageContentTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            translation,
            languageCode,
            aggregateCompositeIdentifier: { id: digitalTextId },
            pageIdentifier,
        },
    }: DigitalTextPageContentTranslated): Promise<void> {
        await this.queryRepository.translatePageContent(
            digitalTextId,
            pageIdentifier,
            translation,
            languageCode
        );
    }
}
