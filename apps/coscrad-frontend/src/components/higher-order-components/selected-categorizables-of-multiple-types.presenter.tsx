import {
    CategorizableType,
    IBaseViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { ErrorDisplay } from '../error-display/error-display';
import { Loading } from '../loading';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/categorizable-detail-presenter-factory.interface';
import { SelectedCategorizablesPresenter } from './selected-categorizables-of-single-type.presenter';
import {
    ViewModelDetailSnapshot,
    ViewModelIndexSnapshot,
    getCategorizableTypeForSliceKey,
} from './use-loadable-categorizables';

import { isNullOrUndefined } from '@coscrad/validation-constraints';

interface SelectedCategorizablesOfMultipleTypesPresenterProps<
    T extends IBaseViewModel = IBaseViewModel
> {
    viewModelSnapshot: ViewModelDetailSnapshot;
    presenterFactory: ICategorizableDetailPresenterFactory<ICategorizableDetailQueryResult<T>>;
    getPluralLabelForCategorizableType: (categorizableType: CategorizableType) => string;
}

export const SelectedCategorizablesOfMultipleTypesPresenter = ({
    viewModelSnapshot,
    presenterFactory,
    getPluralLabelForCategorizableType,
}: SelectedCategorizablesOfMultipleTypesPresenterProps): JSX.Element => {
    return (
        <div data-testid="multiple-categorizables-view">
            {Object.entries(viewModelSnapshot)
                // replace the slice name with corresponding categorizable type
                .map(
                    ([key, value]) =>
                        [
                            // this is currently a hack- we need with mapping slice name to resource type
                            getCategorizableTypeForSliceKey(key as keyof ViewModelIndexSnapshot),
                            value,
                        ] as const
                )
                /**
                 * Flow the loadable (CategorizableDetailQueryResult) state for
                 * each `CategorizableType` into
                 * - SelectedCategorizablesPresenter for the given `categorizableType`
                 * - or error \ loading display if not yet loaded.
                 */
                .map(
                    ([categorizableType, queryResult]: [
                        CategorizableType,
                        ViewModelDetailSnapshot[keyof ViewModelDetailSnapshot]
                    ]) => {
                        /**
                         * Note that we are moving to sending back denormalized
                         * views of the resources on notes (and notes on resources)
                         * and we should leverage these for the notes and
                         * connection panels going forward.
                         */
                        if (queryResult.data instanceof Map) {
                            throw new Error(`terms are not supported here`);
                        }

                        // TODO Use our loadable helper
                        if (queryResult.errorInfo)
                            return <ErrorDisplay {...queryResult.errorInfo} />;

                        if (queryResult.isLoading || isNullOrUndefined(queryResult.data))
                            return <Loading />;

                        return (
                            <SelectedCategorizablesPresenter
                                // @ts-expect-error we should avoid using this with `Terms`. How can we do that?
                                viewModels={queryResult.data}
                                presenterFactory={presenterFactory}
                                pluralLabelForCategorizableType={getPluralLabelForCategorizableType(
                                    categorizableType
                                )}
                                categorizableType={categorizableType}
                            />
                        );
                    }
                )}
        </div>
    );
};
