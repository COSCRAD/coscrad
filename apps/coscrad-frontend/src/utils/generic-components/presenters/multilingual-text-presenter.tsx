import { IMultilingualText } from '@coscrad/api-interfaces';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, Box, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { DefaultLanguageTextPresenter } from './text-presenters/default-language-text-presenter';
import { TranslatedLanguageTextPresenter } from './text-presenters/translated-text-presenter';

// TODO use contentConfigContext
// default language code
// find the text iterm with the default language code
// find the text item with english
// note: either of these may not exist (fallback logic)
// build an appropriate presentation of these properties

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { items } = text;

    const filteredItems = items.filter((item) => item.languageCode === defaultLanguageCode);

    const translations = items.filter((items) => items.languageCode !== defaultLanguageCode);

    return (
        <>
            <Box>
                {filteredItems.map(({ languageCode, text, role }) => (
                    <DefaultLanguageTextPresenter
                        languageCode={languageCode}
                        text={text}
                        role={role}
                    />
                ))}
            </Box>

            <Box>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Translations</Typography>
                    </AccordionSummary>
                    {translations.map(({ languageCode, text, role }) => (
                        <TranslatedLanguageTextPresenter
                            languageCode={languageCode}
                            text={text}
                            role={role}
                        />
                    ))}
                </Accordion>
            </Box>
        </>
    );
};
