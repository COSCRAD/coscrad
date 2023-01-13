import { IValueAndDisplay } from '@coscrad/api-interfaces';

/**
 * Provides a standard presentation for a single property on a view model
 *
 * TODO: Consider a separate utility to add the break tags using reduce
 */
export const SinglePropertyPresenter = <T,>({
    value,
    display,
}: IValueAndDisplay<T>): JSX.Element => (
    <div>
        <>
            <strong>{display}</strong>: {value}
        </>
    </div>
);
