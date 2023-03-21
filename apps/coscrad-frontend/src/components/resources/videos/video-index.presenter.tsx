import { IVideoViewModel } from '@coscrad/api-interfaces';
import { VideoIndexState } from '../../../store/slices/resources/video';
import {
    HeadingLabel,
    IndexViewContainer,
} from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { CoscradPrimaryStyleLayoutContainer } from '../../../utils/generic-components/style-components/coscrad-main-content-container';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMediaLengthInSeconds } from '../utils/render-media-length-in-seconds-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const VideoIndexPresenter = ({ entities: videos }: VideoIndexState): JSX.Element => {
    const headingLabels: HeadingLabel<IVideoViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        {
            propertyKey: 'lengthMilliseconds',
            headingLabel: 'Video Length',
        },
        { propertyKey: 'name', headingLabel: 'Name' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IVideoViewModel> = {
        id: renderAggregateIdCell,
        lengthMilliseconds: ({ lengthMilliseconds }: IVideoViewModel) =>
            renderMediaLengthInSeconds(lengthMilliseconds),
        name: ({ name }: IVideoViewModel) => renderMultilingualTextCell(name),
    };

    return (
        <CoscradPrimaryStyleLayoutContainer>
            <IndexViewContainer
                headingLabels={headingLabels}
                indexViewData={videos}
                cellRenderersDefinition={cellRenderersDefinition}
                heading={'Videos'}
                filterableProperties={['text']}
            />
        </CoscradPrimaryStyleLayoutContainer>
    );
};
