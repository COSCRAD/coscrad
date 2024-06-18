import { IMultilingualTextItem, ResourceType } from '@coscrad/api-interfaces';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import { MultilingualTextItemPresenter } from './multilingual-text-item-presenter';

interface MultilingualTextWithTranslationsProps {
    primaryMultilingualTextItem: IMultilingualTextItem;
    resourceType: ResourceType;
    translations: IMultilingualTextItem[];
}

export const MultilingualTextWithTranslations = ({
    primaryMultilingualTextItem,
    resourceType,
    translations,
}: MultilingualTextWithTranslationsProps): JSX.Element => (
    <Accordion elevation={0} defaultExpanded={resourceType === ResourceType.term ? true : false}>
        <AccordionSummary
            expandIcon={resourceType === ResourceType.term ? null : <ExpandMoreIcon />}
            data-testid="multilingual-text-main-text-item-with-translations"
        >
            <MultilingualTextItemPresenter
                key={primaryMultilingualTextItem.languageCode}
                text={primaryMultilingualTextItem.text}
                variant="h4"
                languageCode={primaryMultilingualTextItem.languageCode}
                role={primaryMultilingualTextItem.role}
            />
        </AccordionSummary>
        <AccordionDetails data-testid="multilingual-text-translations">
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
        </AccordionDetails>
    </Accordion>
);
