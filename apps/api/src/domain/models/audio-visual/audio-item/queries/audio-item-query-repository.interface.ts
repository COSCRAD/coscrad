import { IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../../lib/types/maybe';
import { AggregateId } from '../../../../types/AggregateId';
import { IQueryRepositoryForAnnotatable } from '../../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { IAccessible } from '../../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import {
    ICountable,
    IPublishable,
} from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IQueryRepositoryForTaggable } from '../../../tag/commands/tag-resource-or-note/resource-or-note-tagged.event-handler';
import { ITranscriptQueryRepository } from '../../shared/queries/transcript-query-repository.interface';
import { EventSourcedAudioItemViewModel } from './audio-item.view-model.event-sourced';

export const AUDIO_QUERY_REPOSITORY_TOKEN = 'AUDIO_QUERY_REPOSITORY_TOKEN';

export interface TranslationLineItemDto {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    text: string;
    languageCode: LanguageCode;
}

export interface IAudioItemQueryRepository
    extends IPublishable,
        IAccessible,
        ITranscriptQueryRepository,
        ICountable,
        IQueryRepositoryForTaggable,
        IQueryRepositoryForAnnotatable {
    create(view: EventSourcedAudioItemViewModel): Promise<void>;

    createMany(view: EventSourcedAudioItemViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<EventSourcedAudioItemViewModel>>;

    fetchMany(): Promise<EventSourcedAudioItemViewModel[]>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;
}
