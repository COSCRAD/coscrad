import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { MultilingualTextItemPresenter } from './multilingual-text-item-presenter';

interface MultilingualTextWithTranslationsProps {
    primaryMultilingualTextItem: IMultilingualTextItem;
    translations: IMultilingualTextItem[];
}

export const MultilingualTextWithTranslations = ({
    primaryMultilingualTextItem,
    translations,
}: MultilingualTextWithTranslationsProps): JSX.Element => (
    <Accordion elevation={0}>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            data-testid="multilingual-text-main-text-item-with-translations"
        >
            <MultilingualTextItemPresenter
                key={primaryMultilingualTextItem.languageCode}
                isHeading={false}
                text={primaryMultilingualTextItem.text}
                languageCode={primaryMultilingualTextItem.languageCode}
                role={primaryMultilingualTextItem.role}
            />
        </AccordionSummary>
        <AccordionDetails data-testid="multilingual-text-translations">
            {translations.map(({ text, languageCode, role }) => (
                <MultilingualTextItemPresenter
                    key={languageCode}
                    isHeading={false}
                    text={text}
                    languageCode={languageCode}
                    role={role}
                />
            ))}
        </AccordionDetails>
    </Accordion>
);
