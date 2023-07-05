import {
    AggregateType,
    CategorizableType,
    IBookViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { NoteDetailThumbnailPresenter } from '../../notes/note-detail.thumbnail.presenter';
import { AudioItemDetailThumbnailPresenter } from '../audio-item/audio-item-detail.thumbnail.presenter';
import { BibliographicReferenceDetailThumbnailPresenter } from '../bibliographic-references/bibliographic-reference-detail-thumbnail-presenters';
import { BookDetailThumbnailPresenter } from '../books';
import { BookInfo } from '../books/book-info';
import { MediaItemDetailThumbnailPresenter } from '../media-items/media-item-detail.thumbnail.presenter';
import { PhotographDetailThumbnailPresenter } from '../photographs/photograph-detail.thumbnail.presenter';
import { PlaylistDetailThumbnailPresenter } from '../playlists/playlist-detail.thumbnail.presenter';
import { SongDetailThumbnailPresenter } from '../songs';
import { SpatialFeatureDetailThumbnailPresenter } from '../spatial-features/thumbnail-presenters';
import { TermDetailThumbnailPresenter } from '../terms/term-detail.thumbnail.presenter';
import { VideoDetailThumbnailPresenter } from '../videos';
import { VocabularyListDetailThumbnailPresenter } from '../vocabulary-lists/vocabulary-list-detail.thumbnail.presenter';
import {
    ContextProps,
    ContextualizableComponent,
} from './full-view-categorizable-presenter-factory';

// TODO Define thumbnail specific presenters
const lookupTable: { [K in CategorizableType]: ContextualizableComponent } = {
    [CategorizableType.bibliographicReference]: BibliographicReferenceDetailThumbnailPresenter,
    [CategorizableType.book]: BookDetailThumbnailPresenter,
    [CategorizableType.mediaItem]: MediaItemDetailThumbnailPresenter,
    [CategorizableType.photograph]: PhotographDetailThumbnailPresenter,
    [CategorizableType.song]: SongDetailThumbnailPresenter,
    [CategorizableType.spatialFeature]: SpatialFeatureDetailThumbnailPresenter,
    [CategorizableType.term]: TermDetailThumbnailPresenter,
    [CategorizableType.audioItem]: AudioItemDetailThumbnailPresenter,
    [CategorizableType.video]: VideoDetailThumbnailPresenter,
    [CategorizableType.vocabularyList]: VocabularyListDetailThumbnailPresenter,
    [CategorizableType.playlist]: PlaylistDetailThumbnailPresenter,
    /**
     * TODO Investigate why importing this from the component file leads to a
     * circular dependency.
     */
    [CategorizableType.book]: (
        book: ICategorizableDetailQueryResult<IBookViewModel> & ContextProps
    ): JSX.Element => {
        const { id, pages } = book;

        return (
            // TODO We may want to automate the link wrapping because it's easy to forget
            <Link to={`/${routes.resources.ofType(ResourceType.book).detail(id)}`}>
                <div
                    data-testid={buildDataAttributeForAggregateDetailComponent(
                        AggregateType.mediaItem,
                        id
                    )}
                >
                    <Card>
                        <CardContent>
                            {<BookInfo {...book} />}
                            <div>
                                <strong>page count:</strong> {pages.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Link>
        );
    },
    [CategorizableType.note]: NoteDetailThumbnailPresenter,
};

/**
 * This concrete Resource Detail Presenter Factory provides a thumbnail view of
 * a single resource for each resource type. It is used for the connected
 * resources flow.
 */
export const thumbnailCategorizableDetailPresenterFactory = <T extends CategorizableType>(
    typeOfCategorizable: T
): typeof lookupTable[T] => {
    const lookupResult = lookupTable[typeOfCategorizable];

    if (!lookupResult) {
        throw new Error(
            `Failed to build a full format detail view for resource type: ${typeOfCategorizable}`
        );
    }

    return lookupResult;
};
