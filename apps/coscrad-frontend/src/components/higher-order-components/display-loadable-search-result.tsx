import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { IMaybeLoadable, NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { NotFoundPresenter } from '../not-found';
import { displayLoadableWithErrorsAndLoading } from './display-loadable-with-errors-and-loading';
import { MapLoadedDataToProps } from './types';

export const displayLoadableSearchResult =
    <T, U>(
        // A component that depends on the data already being loaded
        WrappedComponent: FunctionalComponent<U>,
        /**
         * Optional mapping from the loaded data to the dependent component's
         * props.
         *
         * This "Inversion of Control" provides flexibility. For example,
         * we typically prefer to nest array data within an object. In case no
         * map is provided, the default behaviour is to treat the loadable as the props.
         */
        mapLoadedDataToProps?: MapLoadedDataToProps<T, U>
    ) =>
    (searchResult: IMaybeLoadable<T>) => {
        const { data } = searchResult;

        if (data === NOT_FOUND) return <NotFoundPresenter />;

        return displayLoadableWithErrorsAndLoading(
            WrappedComponent,
            mapLoadedDataToProps
            // We have already checked for the case that NOT_FOUND is provided
            // we may want to tighten up types here
        )(searchResult as ILoadable<T>);
    };
