import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Paper, styled } from '@mui/material';
import { MultilingualTextItemPresenter } from './multilingual-text-item-presenter';

const MultilingualTextHeaderBox = styled(Paper)({
    paddingLeft: '8px',
});

interface MultilingualTextWithoutTranslationsProps {
    primaryMultilingualTextItem: IMultilingualTextItem;
}

export const MultilingualTextWithoutTranslations = ({
    primaryMultilingualTextItem,
}: MultilingualTextWithoutTranslationsProps): JSX.Element => (
    <MultilingualTextHeaderBox
        elevation={0}
        data-testid="multilingual-text-main-text-item-without-translations"
    >
        <MultilingualTextItemPresenter isHeading={true} item={primaryMultilingualTextItem} />
    </MultilingualTextHeaderBox>
);
