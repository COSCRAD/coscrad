import { KeysAndLabels } from '../../../components/resources/bibliographic-references/journal-article-bibliographic-reference.full-view.presenter';
import { SinglePropertyPresenter } from './single-property-presenter';

interface MultiPropertyPresenterProps<T> {
    keysAndLabels: KeysAndLabels[];
    presenterData: T;
}

export const MultiPropertyPresenter = <T = unknown,>({
    keysAndLabels,
    presenterData,
}: MultiPropertyPresenterProps<T>): JSX.Element => {
    return (
        <>
            {keysAndLabels.map(({ propertyKey, label }) => (
                <SinglePropertyPresenter display={label} value={presenterData[propertyKey]} />
            ))}
        </>
    );
};
