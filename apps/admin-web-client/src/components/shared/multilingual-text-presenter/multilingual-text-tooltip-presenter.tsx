import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { MultilingualTextItemPresenter } from './multilingual-text-item-presenter';

interface MultilingualTextTooltipPresenterProps {
    primaryMultilingualTextItem: IMultilingualTextItem;
    translations: IMultilingualTextItem[];
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip
        describeChild
        {...props}
        classes={{ popper: className }}
        placement="bottom-start"
        arrow
    />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#487172ff',
        color: '#69e0e0ff',
        paddingTop: '10px',
        maxWidth: 520,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}));

export const MultilingualTextTooltipPresenter = ({
    primaryMultilingualTextItem,
    translations,
}: MultilingualTextTooltipPresenterProps): JSX.Element => {
    return (
        <div>
            <HtmlTooltip
                title={
                    <>
                        <Typography variant="h4">Translations</Typography>
                        {translations.map(({ text, languageCode, role }) => (
                            <Box key={languageCode}>
                                <MultilingualTextItemPresenter
                                    variant="body1"
                                    text={text}
                                    languageCode={languageCode}
                                    role={role}
                                />
                            </Box>
                        ))}
                    </>
                }
            >
                <Button>
                    <MultilingualTextItemPresenter
                        key={primaryMultilingualTextItem.languageCode}
                        text={primaryMultilingualTextItem.text}
                        variant="body1"
                        languageCode={primaryMultilingualTextItem.languageCode}
                        role={primaryMultilingualTextItem.role}
                    />
                </Button>
            </HtmlTooltip>
        </div>
    );
};
