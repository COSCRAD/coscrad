import { IBaseViewModel, ICategorizableDetailQueryResult } from '@coscrad/api-interfaces';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { isInLanguage } from '../../utils/generic-components/presenters/is-in-language';
import { NotesById } from './selected-categorizables-of-multiple-types.presenter';

interface ConnectionNoteProps<T extends IBaseViewModel = IBaseViewModel> {
    viewModel: ICategorizableDetailQueryResult<T>;
    notesById: NotesById[];
}

export const ConnectionNotePresenter = ({
    viewModel,
    notesById,
}: ConnectionNoteProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { id } = viewModel;

    const connectionNoteText = notesById.filter(({ connectionId }) => id === connectionId)[0]
        .connectionNote;

    const textItemWithDefaultLanguage = connectionNoteText.items.find((item) =>
        isInLanguage(defaultLanguageCode, item)
    );

    const { text } = textItemWithDefaultLanguage;

    return (
        <Accordion>
            <AccordionSummary sx={{ fontWeight: 'bold' }} expandIcon={<ExpandMoreIcon />}>
                Connection Note
            </AccordionSummary>
            <AccordionDetails>{text}</AccordionDetails>
        </Accordion>
    );
};
