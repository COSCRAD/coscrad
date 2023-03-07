import { InternalError } from '../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { Aggregate } from '../../models/aggregate.entity';
import { AudioItem } from '../../models/audio-item/entities/audio-item.entity';
import { Video } from '../../models/audio-item/entities/video.entity';
import { Book } from '../../models/book/entities/book.entity';
import { Category } from '../../models/categories/entities/category.entity';
import { EdgeConnection } from '../../models/context/edge-connection.entity';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { Photograph } from '../../models/photograph/entities/photograph.entity';
import { Playlist } from '../../models/playlist';
import { Song } from '../../models/song/song.entity';
import { Tag } from '../../models/tag/tag.entity';
import { Term } from '../../models/term/entities/term.entity';
import { CoscradUserGroup } from '../../models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../../models/user-management/user/entities/user/coscrad-user.entity';
import { VocabularyList } from '../../models/vocabulary-list/entities/vocabulary-list.entity';
import { AggregateType, AggregateTypeToAggregateInstance } from '../../types/AggregateType';

const specialCases = [AggregateType.bibliographicReference, AggregateType.spatialFeature] as const;

type SpecialCaseType = typeof specialCases[number];

type AggregateTypesWithADistinctCtor = Exclude<AggregateType, SpecialCaseType>;

export const aggregateTypeToAggregateCtor: {
    [K in AggregateTypesWithADistinctCtor]: DomainModelCtor<Aggregate>;
} = {
    [AggregateType.tag]: Tag,
    [AggregateType.note]: EdgeConnection,
    [AggregateType.user]: CoscradUser,
    [AggregateType.userGroup]: CoscradUserGroup,
    [AggregateType.book]: Book,
    [AggregateType.mediaItem]: MediaItem,
    [AggregateType.note]: EdgeConnection,
    [AggregateType.photograph]: Photograph,
    [AggregateType.song]: Song,
    [AggregateType.term]: Term,
    // These casts are due to the mixin. Note the subtle difference between value (Ctor) and type (Instance type)
    [AggregateType.audioItem]: AudioItem as unknown as DomainModelCtor<AudioItem>,
    [AggregateType.video]: Video as unknown as DomainModelCtor<Video>,
    [AggregateType.vocabularyList]: VocabularyList,
    [AggregateType.playlist]: Playlist,
    [AggregateType.category]: Category,
};

export default <T extends AggregateType>(
    aggregateType: T
): DomainModelCtor<AggregateTypeToAggregateInstance[T]> => {
    const searchResult = aggregateTypeToAggregateCtor[aggregateType as AggregateType];

    if (!searchResult) {
        throw new InternalError(`Failed to find a CTOR for aggregate of type: ${aggregateType}`);
    }

    return searchResult;
};
