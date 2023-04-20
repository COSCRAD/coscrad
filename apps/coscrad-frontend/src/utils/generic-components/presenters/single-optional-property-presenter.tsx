import { IValueAndDisplay } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { SinglePropertyPresenter } from './single-property-presenter';

export const SingleOptionalPropertyPresenter = <T,>({
    value,
    display,
}: IValueAndDisplay<T>): JSX.Element => {
    if (isNullOrUndefined(value) || value === '') return null;

    return <SinglePropertyPresenter display={display} value={value} />;
};
