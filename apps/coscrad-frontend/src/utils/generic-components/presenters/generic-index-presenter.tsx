import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../types/functional-component';
import './generic-presenters.css';
import { HeadingLabel, IndexTable } from './tables';

type GenericIndexPresenterProps = IIndexQueryResult<IBaseViewModel> & { indexLabel: string };

export const GenericIndexPresenter: FunctionalComponent<GenericIndexPresenterProps> = ({
    data: viewModelsAndActions,
    indexLabel,
}: GenericIndexPresenterProps) => {
    const viewModels = viewModelsAndActions.map(({ data }) => data);

    /**
     * **DO NOT** use this util in production. It is meant to generate a placeholder
     * so we can divide and conquer on development and design work. The followin
     * algorithm may miss optional properties that are missing on the 0th result. If we
     * want to actually use this tool, we should use one of the following
     * approaches:
     * 1. use the model schema from resource info to build headins
     * 2. build up the headings as any property key that shows up on any model
     *     - this still exposes a developer formatted key to the end user, so 1. is a better option
     */
    const headingLabels: HeadingLabel<IBaseViewModel>[] = Object.keys(viewModels[0]).map(
        (key: keyof IBaseViewModel) => ({
            propertyKey: key,
            headingLabel: key,
        })
    );

    const emptyCellRenderersDefinition = {};

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={viewModels}
            cellRenderersDefinition={emptyCellRenderersDefinition}
            // This should be a resource lable from resource info
            heading={indexLabel}
        />
    );
};
