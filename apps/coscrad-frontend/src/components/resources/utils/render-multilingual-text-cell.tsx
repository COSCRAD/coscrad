import { IMultilingualText, MultilingualTextItemRole } from '@coscrad/api-interfaces';

export const renderMultilingualTextCell = ({ items }: IMultilingualText): JSX.Element => {
    const originalItem = items.find(({ role }) => role === MultilingualTextItemRole.original);

    return (
        <div>
            {originalItem.text} ({originalItem.languageCode})
        </div>
    );
};
