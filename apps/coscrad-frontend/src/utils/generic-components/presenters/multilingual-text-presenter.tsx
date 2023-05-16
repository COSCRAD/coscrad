import { IMultilingualText } from '@coscrad/api-interfaces';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';

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

    if (!Array.isArray(filteredItems)) {
        throw new Error(`invalid input to Multlingual text!: ${text}`);
    }

    return (
        <>
            <Box>
                {filteredItems.map(({ languageCode, text, role }) => (
                    <Box key={`${languageCode}-${role}`}>
                        {text}
                        <Typography variant="subtitle1" color={'secondary.dark'}>
                            {`${languageCode}, '${role}'`}
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Box>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Translations</Typography>
                    </AccordionSummary>
                    {translations.map(({ languageCode, text, role }) => (
                        <AccordionDetails key={`${languageCode}-${role}`}>
                            <Typography color={'text.primary'}>
                                {text}
                                <br />
                                {`${languageCode}, '${role}'`}
                            </Typography>
                        </AccordionDetails>
                    ))}
                </Accordion>
            </Box>
        </>
    );
};
