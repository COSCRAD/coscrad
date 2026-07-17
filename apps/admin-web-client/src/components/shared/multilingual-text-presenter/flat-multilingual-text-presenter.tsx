import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Box, Paper, styled } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { MultilingualTextItemPresenter } from './multilingual-text-item-presenter';

const MultilingualTextBox = styled(Paper)({
    paddingLeft: '8px',
});

interface FlatMultilingualTextPresenterProps {
    primaryMultilingualTextItem: IMultilingualTextItem;
    translations: IMultilingualTextItem[];
    variant?: Variant;
}

export const FlatMultilingualTextPresenter = ({
    primaryMultilingualTextItem,
    translations,
    variant,
}: FlatMultilingualTextPresenterProps): JSX.Element => {
    const { text, languageCode, role } = primaryMultilingualTextItem;

    return (
        <MultilingualTextBox
            elevation={0}
            data-testid="multilingual-text-main-text-item-without-translations"
        >
            <MultilingualTextItemPresenter
                key={languageCode}
                variant={variant || 'h4'}
                text={text}
                languageCode={languageCode}
                role={role}
            />
            {translations.length > 0 ? (
                <>
                    {translations.map(({ text, languageCode, role }) => (
                        <Box mt={1}>
                            <MultilingualTextItemPresenter
                                key={languageCode}
                                variant={variant || 'h5'}
                                text={text}
                                languageCode={languageCode}
                                role={role}
                            />
                        </Box>
                    ))}
                </>
            ) : null}
        </MultilingualTextBox>
    );
};
