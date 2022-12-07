import {
    CategorizableType,
    IBookViewModel,
    IDetailQueryResult,
    INoteViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { NoteDetailThumbnailPresenter } from '../../notes/note-detail.thumbnail.presenter';
import { BibliographicReferenceDetailThumbnailPresenter } from '../bibliographic-references/bibliographic-reference-detail-thumbnail-presenters';
import { MediaItemDetailPresenter } from '../media-items/media-item-detail.presenter';
import { PhotographDetailThumbnailPresenter } from '../photographs/photograph-detail.thumbnail.presenter';
import { SongDetailThumbnailPresenter } from '../songs';
import { SpatialFeatureDetailThumbnailPresenter } from '../spatial-features/thumbnail-presenters';
import { TermDetailThumbnailPresenter } from '../terms/term-detail.thumbnail.presenter';
import { TranscribedAudioDetailThumbnailPresenter } from '../transcribed-audio/transcribed-audio-detail.thumbnail.presenter';
import { VocabularyListDetailThumbnailPresenter } from '../vocabulary-lists/vocabulary-list-detail.thumbnail.presenter';

// TODO Define thumbnail specific presenters
const lookupTable: { [K in CategorizableType]: FunctionalComponent } = {
    [CategorizableType.bibliographicReference]: BibliographicReferenceDetailThumbnailPresenter,
    [CategorizableType.mediaItem]: MediaItemDetailPresenter,
    [CategorizableType.photograph]: PhotographDetailThumbnailPresenter,
    [CategorizableType.song]: SongDetailThumbnailPresenter,
    [CategorizableType.spatialFeature]: SpatialFeatureDetailThumbnailPresenter,
    [CategorizableType.term]: TermDetailThumbnailPresenter,
    [CategorizableType.transcribedAudio]: TranscribedAudioDetailThumbnailPresenter,
    [CategorizableType.vocabularyList]: VocabularyListDetailThumbnailPresenter,
    /**
     * TODO Investigate why importing this from the component file leads to a
     * circular dependency.
     */
    [CategorizableType.book]: ({
        data: { id, pages, title, subtitle, author, publicationDate },
    }: IDetailQueryResult<IBookViewModel>): JSX.Element => {
        return (
            // TODO We may want to automate the link wrapping because it's easy to forget
            <Link to={`/${routes.resources.ofType(ResourceType.book).detail(id)}`}>
                <div data-testid={id}>
                    <Card>
                        <CardContent>
                            <div>
                                <h1>{title}</h1>
                                {subtitle && <h3>{subtitle}</h3>}
                                <strong>by</strong> {author}
                                <br />
                                {publicationDate && (
                                    <div>
                                        <strong>published</strong> {publicationDate}
                                    </div>
                                )}
                            </div>
                            <div>
                                <strong>page count:</strong> {pages.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Link>
        );
    },
    // TODO remove this hack
    [CategorizableType.note]: ({ data: note }: IDetailQueryResult<INoteViewModel>) =>
        NoteDetailThumbnailPresenter(note),
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
