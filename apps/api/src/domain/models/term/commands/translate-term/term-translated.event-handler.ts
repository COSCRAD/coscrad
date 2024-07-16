import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import {
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../../domain/common/entities/multilingual-text';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { TermTranslated } from './term-translated.event';

export class TermTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termRepository: ITermQueryRepository
    ) {}

    async handle(event: TermTranslated): Promise<void> {
        // TODO Use dynamic registration
        if (!event.isOfType('TERM_TRANSLATED')) return;

        const {
            payload: {
                aggregateCompositeIdentifier: { id: termId },
                translation,
                languageCode,
            },
        } = event;

        await this.termRepository.translate(
            termId,
            new MultilingualTextItem({
                text: translation,
                languageCode,
                // should this be on the event payload?
                role: MultilingualTextItemRole.freeTranslation,
            })
        );
    }
}
