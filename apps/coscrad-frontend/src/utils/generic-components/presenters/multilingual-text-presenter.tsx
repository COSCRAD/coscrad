import { IMultilingualText } from '@coscrad/api-interfaces';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { items } = text;

    if (!Array.isArray(items)) {
        throw new Error(`invalid input to Multlingual text!: ${text}`);
    }

    return (
        <>
            {/* TODO We need to separate the original in some way */}
            {items.map(({ languageCode, text, role }) => (
                <div key={`${languageCode}-${role}`}>
                    {`{${languageCode}} [${role}]`} {text}
                </div>
            ))}
        </>
    );
};
