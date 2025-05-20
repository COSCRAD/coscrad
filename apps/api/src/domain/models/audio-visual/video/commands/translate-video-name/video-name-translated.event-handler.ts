import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../../domain/common';
import {
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../../../domain/common/entities/multilingual-text';
import { IVideoQueryRepository, VIDEO_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { VideoNameTranslated } from './video-name-translated.event';

export class VideoNameTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VIDEO_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IVideoQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            text,
            languageCode,
        },
    }: VideoNameTranslated): Promise<void> {
        await this.queryRepository.translateName(
            id,
            new MultilingualTextItem({
                text,
                languageCode,
                role: MultilingualTextItemRole.freeTranslation,
            })
        );
    }
}
