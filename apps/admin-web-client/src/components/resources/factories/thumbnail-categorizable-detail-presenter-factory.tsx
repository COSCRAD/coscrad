import { CategorizableType } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../shared/types';
import { SpatialFeatureDetailThumbnailPresenter } from '../spatial-features/thumbnail-presenters';
import { TermDetailThumbnailPresenter } from '../terms/term-detail-thumbnail';

interface ThumbnailPresenterProps {
    id: string;
    shouldDisplayActionButtons: boolean;
}

// TODO Define thumbnail specific presenters
const lookupTable: { [K in CategorizableType]: FunctionalComponent<ThumbnailPresenterProps> } = {
    [CategorizableType.bibliographicCitation]: () => {
        throw new Error('not implemented');
    },
    [CategorizableType.digitalText]: () => {
        throw new Error('not implemented');
    },
    [CategorizableType.mediaItem]: () => {
        throw new Error('not implemented');
    },
    [CategorizableType.photograph]: () => {
        throw new Error('not implemented');
    },
    [CategorizableType.song]: () => {
        throw new Error('not implemented');
    },
    [CategorizableType.spatialFeature]: SpatialFeatureDetailThumbnailPresenter,
    [CategorizableType.term]: TermDetailThumbnailPresenter,
    [CategorizableType.audioItem]: () => {
        throw new Error('not implemented');
    },
    [CategorizableType.video]: () => {
        throw new Error('not implemented');
    },
    [CategorizableType.vocabularyList]: () => {
        throw new Error('not implemented');
    },
    [CategorizableType.playlist]: () => {
        throw new Error('not implemented');
    },
    [CategorizableType.map]: () => {
        throw new Error('not implemented');
    },
    /**
     * TODO Investigate why importing this from the component file leads to a
     * circular dependency.
     */
    [CategorizableType.note]: () => {
        throw new Error('not implemented');
    },
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
