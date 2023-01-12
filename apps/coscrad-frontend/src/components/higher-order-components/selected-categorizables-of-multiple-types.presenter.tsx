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
    getCategorizableTypeForSliceKey,
    ViewModelDetailSnapshot,
    ViewModelIndexSnapshot,
} from './use-loadable-categorizables';

import { isNullOrUndefined } from '@coscrad/validation-constraints';

interface SelectedCategorizablesOfMultipleTypesPresenterProps<
    T extends IBaseViewModel = IBaseViewModel
> {
    viewModelSnapshot: ViewModelDetailSnapshot;
    presenterFactory: ICategorizableDetailPresenterFactory<ICategorizableDetailQueryResult<T>>;
    getPluralLabelForCategorizableType: (categorizableType: CategorizableType) => string;
}

export const SelectedCategorizablesOfMultipleTypesPresenter = <T extends IBaseViewModel>({
    viewModelSnapshot,
    presenterFactory,
    getPluralLabelForCategorizableType,
}: SelectedCategorizablesOfMultipleTypesPresenterProps): JSX.Element => {
    console.log({
        viewModelSnapshot,
    });

    return (
        <>
            {Object.entries(viewModelSnapshot)
                .map(
                    ([key, value]) =>
                        [
                            getCategorizableTypeForSliceKey(key as keyof ViewModelIndexSnapshot),
                            value,
                        ] as const
                )
                .map(
                    ([categorizableType, queryResult]: [
                        CategorizableType,
                        ViewModelDetailSnapshot[keyof ViewModelDetailSnapshot]
                    ]) => {
                        // TODO Use our loadable helper
                        if (queryResult.errorInfo)
                            return <ErrorDisplay {...queryResult.errorInfo} />;

                        // Maybe the display loadable helper needs to check for udnefined as well?
                        if (queryResult.isLoading || isNullOrUndefined(queryResult.data))
                            return <Loading />;

                        console.log({
                            data: queryResult.data,
                        });

                        return (
                            <SelectedCategorizablesPresenter
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
        </>
    );
};
