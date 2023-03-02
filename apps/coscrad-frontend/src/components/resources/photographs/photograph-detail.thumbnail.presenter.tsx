import {
    ICategorizableDetailQueryResult,
    IMultilingualText,
    IPhotographViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from 'apps/coscrad-frontend/src/utils/generic-components';
import { ResourceDetailThumbnailPresenter } from 'apps/coscrad-frontend/src/utils/generic-components/presenters/detail-views';

export const PhotographDetailThumbnailPresenter = ({
    id,
    imageURL,
    photographer,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    /**
     * Temporary placeholder: I'm putting a name here instead of editing the
     * view model for photograph.  I assume we'll assign a name property in
     * the domain first
     */
    const name: IMultilingualText = new MultilingualText({
        items: [
            new MultilingualTextItem({
                text,
                languageCode,
                role: MultilingualTextItemRole.original,
            }),
        ],
    });

    return (
        <ResourceDetailThumbnailPresenter
            id={id}
            name={name}
            type={ResourceType.photograph}
            src={imageURL}
        >
            <SinglePropertyPresenter display="Photograph ID" value={id} />
            <SinglePropertyPresenter display="Photographer" value={photographer} />
        </ResourceDetailThumbnailPresenter>
    );
};
