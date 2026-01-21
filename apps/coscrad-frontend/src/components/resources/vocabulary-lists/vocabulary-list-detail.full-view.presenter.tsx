import {
    ICategorizableDetailQueryResult,
    IVocabularyListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import React from 'react';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components';
import {
    VocabularyListEntryViewType,
    isVocabularyListEntryViewType,
} from './entries/vocabulary-list-entry-view-type.enum';
import { VocabularyListEntryPresenter } from './entries/vocabulary-list-entry.presenter';

export const VocabularyListDetailFullViewPresenter = ({
    id,
    name,
    entries,
    form,
    contributions,
    table,
}: ICategorizableDetailQueryResult<IVocabularyListViewModel>): JSX.Element => {
    const [entryViewType, setEntryViewType] = React.useState(VocabularyListEntryViewType.Carousel);

    const handleChange = (_event: React.MouseEvent<HTMLElement>, entryViewType: unknown) => {
        /**
         * In the e2e test, we encountered a first event that had null data on first
         * render. We ignore this.
         */
        if (entryViewType === null) {
            return;
        }

        if (!isVocabularyListEntryViewType(entryViewType)) {
            throw new Error(
                `Failed to set the vocabulary list entry view type to invalid value: ${entryViewType}`
            );
        }

        setEntryViewType(entryViewType);
    };

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.vocabularyList}
            contributions={contributions}
        >
            <Box sx={{ textAlign: 'center', mb: 1 }}>
                <ToggleButtonGroup
                    color="primary"
                    value={entryViewType}
                    exclusive
                    onChange={handleChange}
                    aria-label="Vocabulary List"
                >
                    {Object.entries(VocabularyListEntryViewType).map(([label, viewType]) => (
                        <ToggleButton sx={{ borderRadius: 10 }} value={label}>
                            {label} (value: {viewType})
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
            <div>view type: {entryViewType}</div>
            <VocabularyListEntryPresenter
                viewType={entryViewType}
                entries={entries}
                form={form}
                table={table}
            />
        </ResourceDetailFullViewPresenter>
    );
};
