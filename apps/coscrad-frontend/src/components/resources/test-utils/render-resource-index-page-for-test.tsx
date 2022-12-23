import { ResourceType } from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../../utils/test-utils';
import { FilteredCategorizableIndexContainer } from '../../higher-order-components';
import { buildUseLoadableForSingleCategorizableType } from '../../higher-order-components/buildUseLoadableResourcesOfSingleType';
import { tableViewCategorizableIndexPresenterFactory } from '../factories/table-view-categorizable-index-presenter-factory';

export const renderResourceIndexPageForTest = (resourceType: ResourceType) =>
    renderWithProviders(
        <MemoryRouter>
            <FilteredCategorizableIndexContainer
                // @ts-expect-error investigate the type error here
                useLoadableModels={buildUseLoadableForSingleCategorizableType(resourceType)}
                IndexPresenter={tableViewCategorizableIndexPresenterFactory(resourceType)}
                aggregateType={resourceType}
            />
        </MemoryRouter>
    );
