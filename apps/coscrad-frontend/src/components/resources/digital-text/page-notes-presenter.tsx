import {
    IDigitalTextPage,
    IPageRangeContext,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ExpandMore as ExpandMoreIcon, StickyNote2 as StickyNote2Icon } from '@mui/icons-material/';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { useLoadableSelfNotesForResource } from '../../../store/slices/notes';

interface PageNotesPresenterProps {
    compositeIdentifier: ResourceCompositeIdentifier;
    page: IDigitalTextPage;
}

export const PageNotesPresenter = ({
    compositeIdentifier,
    page,
}: PageNotesPresenterProps): JSX.Element => {
    const { identifier } = page;

    const { data: notesForThisDigitalText } = useLoadableSelfNotesForResource(compositeIdentifier);

    if (!isNullOrUndefined(notesForThisDigitalText)) {
        const filteredNotes = notesForThisDigitalText.filter((note) => {
            const { context } = note;

            const pageRangeContext = context as IPageRangeContext;

            const { pageIdentifiers } = pageRangeContext;

            return pageIdentifiers.includes(identifier);
        });

        if (filteredNotes.length > 0) {
            return (
                <Accordion elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ fontWeight: 'bold' }}>
                        Notes for page {identifier} ({filteredNotes.length})
                    </AccordionSummary>
                    <AccordionDetails>
                        {filteredNotes.map(({ text }) => (
                            <Box
                                sx={{ mb: 1, alignItems: 'center', display: 'flex' }}
                                key={text.slice(0, 30).replace(' ', '-')}
                            >
                                <StickyNote2Icon sx={{ mr: 1 }} />
                                <Typography
                                    component="span"
                                    key={text.slice(0, 30).replace(' ', '-')}
                                >
                                    {text}
                                </Typography>
                            </Box>
                        ))}
                    </AccordionDetails>
                </Accordion>
            );
        }
    }

    return null;
};
