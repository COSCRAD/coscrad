import { Maybe } from '../../../../lib/types/maybe';
import { DigitalTextViewModel } from '../../../../queries/digital-text';
import { AggregateId } from '../../../types/AggregateId';
import { IQueryRepositoryForConnectable } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { IQueryRepositoryForAnnotatable } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import {
    ICountable,
    IPublishable,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IQueryRepositoryForTaggable } from '../../tag/commands/tag-resource-or-note/resource-or-note-tagged.event-handler';

export const DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN =
    'DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN';

export interface IDigitalTextQueryRepository
    extends ICountable,
        IAccessible,
        IQueryRepositoryForAnnotatable,
        IQueryRepositoryForConnectable,
        IQueryRepositoryForTaggable,
        IPublishable {
    // IAttributable

    create(digitalText: DigitalTextViewModel): Promise<void>;
    createMany(digitalTexts: DigitalTextViewModel[]): Promise<void>;
    fetchById(id: AggregateId): Promise<Maybe<DigitalTextViewModel>>;
    fetchMany(): Promise<DigitalTextViewModel[]>;
}
