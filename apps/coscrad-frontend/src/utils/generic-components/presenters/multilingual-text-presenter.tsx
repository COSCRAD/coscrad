import { IMultilingualText, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { getLabelForLanguage } from './text-presenters/get-label-for-language';
import { TranslatedLanguageTextPresenter } from './text-presenters/translated-text-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { items } = text;

    const textItemWithDefaultLanguage =
        items?.find((item) => item.languageCode === defaultLanguageCode) || null;

    const primaryMultilingualTextItem = isNullOrUndefined(textItemWithDefaultLanguage)
        ? items?.find((item) => item.role === MultilingualTextItemRole.original)
        : textItemWithDefaultLanguage;

    const translations = items?.filter((items) => items.languageCode !== defaultLanguageCode);

    return (
        <Box width={'fit-content'} data-testid="multilingual-text-display">
            <Accordion elevation={0}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    data-testid="multilingual-text-main-text-item"
                >
                    <Typography variant="h4" margin={'auto 0'}>
                        {primaryMultilingualTextItem.text}
                        <Tooltip
                            title={`${getLabelForLanguage(
                                primaryMultilingualTextItem.languageCode
                            )}, '${primaryMultilingualTextItem.role}'`}
                        >
                            <IconButton>
                                <LanguageIcon />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                </AccordionSummary>
                <AccordionDetails data-testid="multilingual-text-translations">
                    {translations.map(({ languageCode, text, role }) => (
                        <TranslatedLanguageTextPresenter
                            key={`${languageCode}-${role}`}
                            languageCode={languageCode}
                            text={text}
                            role={role}
                        />
                    ))}
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
