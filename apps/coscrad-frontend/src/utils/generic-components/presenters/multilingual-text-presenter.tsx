import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import {
    Accordion,
    AccordionSummary,
    Box,
    Divider,
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
        items.find((item) => item.languageCode === defaultLanguageCode) || null;

    const translations = items.filter((items) => items.languageCode !== defaultLanguageCode);

    return (
        <Box>
            <Accordion variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h4" sx={{ margin: '0' }}>
                        {isNullOrUndefined(textItemWithDefaultLanguage)
                            ? 'Translations'
                            : textItemWithDefaultLanguage.text}
                    </Typography>
                    {isNullOrUndefined(textItemWithDefaultLanguage) ? null : (
                        <Tooltip
                            sx={{ paddingTop: 0, marginBottom: 0 }}
                            title={`${getLabelForLanguage(
                                textItemWithDefaultLanguage.languageCode
                            )}, '${textItemWithDefaultLanguage.role}'`}
                        >
                            <IconButton>
                                <LanguageIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </AccordionSummary>
                <Divider />
                {translations.map(({ languageCode, text, role }) => (
                    <TranslatedLanguageTextPresenter
                        key={`${languageCode}-${role}`}
                        languageCode={languageCode}
                        text={text}
                        role={role}
                    />
                ))}
            </Accordion>
        </Box>
    );
};
