import { ResourceType } from '@coscrad/api-interfaces';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../../utils/test-utils';
import { FilteredCategorizableIndexContainer } from '../../higher-order-components';
import { tableViewCategorizableIndexPresenterFactory } from '../factories/table-view-categorizable-index-presenter-factory';

export const renderResourceIndexPageForTest = (resourceType: ResourceType) =>
    renderWithProviders(
        <MemoryRouter>
            <FilteredCategorizableIndexContainer
                IndexPresenter={tableViewCategorizableIndexPresenterFactory(resourceType)}
                aggregateType={resourceType}
            />
        </MemoryRouter>
    );
