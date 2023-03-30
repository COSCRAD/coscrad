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
            {Object.entries(keysAndLabels).map(([propertyKey, label]) => {
                // `year` and `numberOfPages` in book are both numbers
                const propertyValueAsString = data[propertyKey].toString();

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
