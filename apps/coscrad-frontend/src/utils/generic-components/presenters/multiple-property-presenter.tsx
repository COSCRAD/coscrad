import { isNullOrUndefined, isNumber, isString } from '@coscrad/validation-constraints';
import { SinglePropertyPresenter } from './single-property-presenter';

export type PropertyLabels<T> = {
    [K in keyof T]?: string;
};

interface MultiPropertyPresenterProps<T> {
    keysAndLabels: PropertyLabels<T>;
    data: T;
}

export const MultiplePropertyPresenter = <T,>({
    keysAndLabels,
    data,
}: MultiPropertyPresenterProps<T>): JSX.Element => {
    return (
        <>
            {Object.entries(keysAndLabels)
                .filter(([propertyKey, _]) => !isNullOrUndefined(data[propertyKey]))
                .map(([propertyKey, label]) => {
                    const propertyValue = data[propertyKey];

                    if (!isString(propertyValue) && !isNumber(propertyValue)) {
                        throw new Error(
                            'Only string or number valued properties are supported by MultiplePropertyPresenter'
                        );
                    }

                    const propertyValueAsString = propertyValue.toString();

                    return (
                        <SinglePropertyPresenter
                            key={label as string}
                            display={label as string}
                            value={propertyValueAsString}
                        />
                    );
                })}
        </>
    );
};
