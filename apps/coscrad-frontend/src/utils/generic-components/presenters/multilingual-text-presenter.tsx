import { IMultilingualText } from '@coscrad/api-interfaces';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text: { items },
}: MultilingualTextPresenterProps): JSX.Element => (
    <>
        {/* TODO We need to separate the original in some way */}
        {items.map(({ languageCode, text, role }) => (
            <div>
                {`{${languageCode}} [${role}]`} {text}
            </div>
        ))}
    </>
);
