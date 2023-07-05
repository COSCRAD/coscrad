import { CategorizableType, isResourceType } from '@coscrad/api-interfaces';
import { routes } from '../../../app/routes/routes';
import { renderWithProviders } from '../../../utils/test-utils';
import { withDetailRoute } from '../../../utils/test-utils/with-detail-route';
import { CategorizablePage } from '../../higher-order-components/aggregate-page';
import { fullViewCategorizablePresenterFactory } from '../factories/full-view-categorizable-presenter-factory';

/**
 * Note that this test helper is somewhat coupled to the implementation. We should
 * eventually do this test with Cypress, so that how the component gets rendered
 * when you go to a resource detail path is an implementation detail.
 */
export const buildCategorizableDetailPageRendererForTest =
    (categorizableType: CategorizableType) => (idInLocation: string) =>
        renderWithProviders(
            withDetailRoute(
                idInLocation,
                isResourceType(categorizableType)
                    ? `/${routes.resources.ofType(categorizableType).detail()}/`
                    : `/${routes.notes.detail()}/`,
                <CategorizablePage
                    categorizableType={categorizableType}
                    detailPresenterFactory={fullViewCategorizablePresenterFactory}
                />
            )
        );
