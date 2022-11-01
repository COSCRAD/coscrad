import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';

export type HasData<T> = {
    data: T;
};

type MapLoadedDataToProps<T, UProps> = (loadable: T) => UProps;

type Presenter<T> = FunctionalComponent<T>;

export const displayLoadableWithErrorsAndLoading =
    <T, U>(
        WrappedPresenterComponent: Presenter<U>,
        /**
         * This "Inversion of Control" provides flexibility. For example,
         * we typically prefer to nest array data within an object. In case no
         * map is provided, the default behaviour is to treat the loadable as the props.
         */
        mapLoadedDataToPresenterProps?: MapLoadedDataToProps<T, U>
    ) =>
    (loadable: ILoadable<T>) => {
        const { errorInfo, isLoading, data } = loadable;

        if (errorInfo) {
            return <ErrorDisplay {...errorInfo}></ErrorDisplay>;
        }

        if (isLoading || data === null) return <Loading></Loading>;

        if (data === undefined) {
            throw new Error(`A loadable cannot have the state {data: undefined}`);
        }

        // default to the identity map if no map is provided (this typically is what we want with non-array loaded data)
        const props = mapLoadedDataToPresenterProps
            ? mapLoadedDataToPresenterProps(data)
            : // Is there a better way to handle the type correlation using inference?
              (data as unknown as U);

        return <WrappedPresenterComponent {...props} />;
    };
