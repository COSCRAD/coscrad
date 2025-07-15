import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../src/domain/common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { PagesImportedToDigitalText } from './pages-imported-to-digital-text.event';

@CoscradEventConsumer('PAGES_IMPORTED_TO_DIGITAL_TEXT')
export class PagesImportedToDigitalTextEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: digitalTextId },
            pages,
        },
    }: PagesImportedToDigitalText): Promise<void> {
        await this.queryRepository.importPages(digitalTextId, pages);
    }
}
