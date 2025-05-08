import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../../domain/common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { AggregateId } from '../../../../../../../domain/types/AggregateId';
import { AudiovisualResourceType } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { TranslationItem } from './import-translations-for-transcript.command';
import { TranslationsImportedForTranscript } from './translations-imported-for-transcript.event';

interface IRepository {
    importTranslationsForTranscript(
        id: AggregateId,
        translations: TranslationItem[]
    ): Promise<void>;
}

interface IAudiovisualItemQueryRepositoryProvider<T extends IRepository = IRepository> {
    forResource(audiovisualResourceType: AudiovisualResourceType): T;
}

@CoscradEventConsumer('TRANSLATIONS_IMPORTED_FOR_TRANSCRIPT')
export class TranslationsImportedForTranscsriptEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly audiovisualItemRepositoryProvider: IAudiovisualItemQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { type: resourceType, id },
            translationItems,
        },
    }: TranslationsImportedForTranscript): Promise<void> {
        if (resourceType === ResourceType.video) {
            console.log(`video transcription is not yet supported in the query layer`);
        }

        await this.audiovisualItemRepositoryProvider
            .forResource(resourceType)
            .importTranslationsForTranscript(id, translationItems);
    }
}
