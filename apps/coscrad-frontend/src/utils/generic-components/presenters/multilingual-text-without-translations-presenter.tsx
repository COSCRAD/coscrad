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
}: MultilingualTextWithoutTranslationsProps): JSX.Element => {
    const { text, languageCode, role } = primaryMultilingualTextItem;

    return (
        <MultilingualTextHeaderBox
            elevation={0}
            data-testid="multilingual-text-main-text-item-without-translations"
        >
            <MultilingualTextItemPresenter
                key={languageCode}
                isHeading={false}
                text={text}
                languageCode={languageCode}
                role={role}
            />
        </MultilingualTextHeaderBox>
    );
};
