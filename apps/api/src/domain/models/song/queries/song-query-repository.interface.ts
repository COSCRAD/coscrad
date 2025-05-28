import { IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { AggregateId } from '../../../types/AggregateId';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import {
    ICountable,
    IPublishable,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { EventSourcedSongViewModel } from './song.view-model.event.sourced';

export const SONG_QUERY_REPOSITORY_TOKEN = 'SONG_QUERY_REPOSITORY_TOKEN';

export interface ISongQueryRepository extends IPublishable, IAccessible, ICountable {
    create(view: EventSourcedSongViewModel): Promise<void>;

    createMany(view: EventSourcedSongViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<EventSourcedSongViewModel>>;

    fetchMany(): Promise<EventSourcedSongViewModel[]>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    addLyrics(id: AggregateId, textForLyrics: string, languageCode: LanguageCode): Promise<void>;

    translateLyrics(id: AggregateId, translation: IMultilingualTextItem): Promise<void>;
}
