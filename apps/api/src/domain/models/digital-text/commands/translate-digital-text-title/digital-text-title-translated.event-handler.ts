import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { DigitalTextTitleTranslated } from './digital-text-title-translated.event';

export class DigitalTextTitleTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            translation,
            languageCode,
            aggregateCompositeIdentifier: { id: digitalTextId },
        },
    }: DigitalTextTitleTranslated): Promise<void> {
        await this.queryRepository.translateTitle(digitalTextId, translation, languageCode);
    }
}
