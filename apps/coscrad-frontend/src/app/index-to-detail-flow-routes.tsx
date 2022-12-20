import { CategorizableType } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { Route } from 'react-router-dom';
import { FilteredCategorizableIndexContainer } from '../components/higher-order-components';
import { buildUseLoadableForSingleCategorizableType } from '../components/higher-order-components/buildUseLoadableResourcesOfSingleType';
import { ResourcePage } from '../components/higher-order-components/resource-page';
import { NoteDetailContainer } from '../components/notes/note-detail.container';
import { NoteIndexContainer } from '../components/notes/note-index.container';
import { fullViewCategorizablePresenterFactory } from '../components/resources/factories/full-view-categorizable-presenter-factory';
import { tableViewCategorizableIndexPresenterFactory } from '../components/resources/factories/table-view-categorizable-index-presenter-factory';
import { thumbnailCategorizableDetailPresenterFactory } from '../components/resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { ConfigurableContentContext } from '../configurable-front-matter/configurable-content-provider';
import { DetailViewType } from '../configurable-front-matter/data/configurableContentSchema';
import { routes } from './routes/routes';

export const IndexToDetailFlowRoutes = () => {
    const { indexToDetailFlows } = useContext(ConfigurableContentContext);

    return indexToDetailFlows.map(({ categorizableType, detailViewType, indexFilter }) => {
        /**
         * TODO [https://www.pivotaltracker.com/story/show/184069659]
         * Fix this assymetry- it prevents our filtered index approach for notes
         */
        if (categorizableType === CategorizableType.note) {
            return (
                <>
                    <Route path={routes.notes.index} element={<NoteIndexContainer />} />
                    <Route path={routes.notes.detail()} element={<NoteDetailContainer />} />
                </>
            );
        }

        const routeBuilder = routes.resources.ofType(categorizableType);

        /**
         * TODO Use a switch, lookup table, or OOP & polymorphism as soon as
         * you have a third view type.
         *
         * Note that we are making `full-view` the default here.
         */
        const detailPresenterFactory =
            detailViewType === DetailViewType.thumbnail
                ? thumbnailCategorizableDetailPresenterFactory
                : fullViewCategorizablePresenterFactory;

        return (
            <>
                <Route
                    path={routeBuilder.index}
                    element={
                        <FilteredCategorizableIndexContainer
                            // @ts-expect-error fix types
                            useLoadableModels={buildUseLoadableForSingleCategorizableType(
                                categorizableType
                            )}
                            IndexPresenter={tableViewCategorizableIndexPresenterFactory(
                                categorizableType
                            )}
                            filter={indexFilter}
                        />
                    }
                />
                <Route
                    path={routeBuilder.detail()}
                    element={
                        <ResourcePage
                            resourceType={categorizableType}
                            detailPresenterFactory={detailPresenterFactory}
                        />
                    }
                />
            </>
        );
    });
};
