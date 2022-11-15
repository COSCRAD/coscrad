import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { thumbnailResourceDetailContainerFactory } from '../../../../../components/resources/factories/thumbnail-resource-detail-container-factory';

export const ResourceDetailThumbnail = ({ type, id }: ResourceCompositeIdentifier) => {
    const DetailContainer = thumbnailResourceDetailContainerFactory(type);

    return <DetailContainer id={id} />;
};
