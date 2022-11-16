import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { AggregateDetailContainer } from '../../../../../components/higher-order-components/aggregate-detail-container';
import { thumbnailResourceDetailPresenterFactory } from '../../../../../components/resources/factories/thumbnail-resource-detail-presenter-factory';

export const ResourceDetailThumbnail = (compositeIdentifier: ResourceCompositeIdentifier) =>
    AggregateDetailContainer({
        compositeIdentifier,
        detailPresenterFactory: thumbnailResourceDetailPresenterFactory,
    });
