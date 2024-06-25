import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IDigitalTextViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Box, Button, Stack } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { executeCommand } from '../../../store/slices/command-status';
import {
    CommaSeparatedList,
    ResourceDetailFullViewPresenter,
    SinglePropertyPresenter,
} from '../../../utils/generic-components';
import { cyclicDecrement, cyclicIncrement } from '../../../utils/math';
import { ImmersiveCreateNoteForm } from '../shared/immersive-create-note-form';
import { InteractivePagesPresenter } from './interactive-pages-presenter';
import { PublicationForm } from './page-publication-form';
import { PagesPresenter } from './pages-presenter';

const ADD_PAGE_TO_DIGITAL_TEXT = 'ADD_PAGE_TO_DIGITAL_TEXT';

export const DigitalTextDetailFullViewPresenter = ({
    id,
    title: name,
    pages,
    isPublished,
    tags,
    actions,
}: ICategorizableDetailQueryResult<IDigitalTextViewModel>): JSX.Element => {
    const dispatch = useAppDispatch();

    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const selectedPageIdentifier = pages.length > 0 ? pages[currentIndex].identifier : undefined;

    const aggregateCompositeIdentifier = {
        type: AggregateType.digitalText,
        id,
    };

    const loggedInWithAccess = actions.some(
        ({ type: commandType }) => commandType === ADD_PAGE_TO_DIGITAL_TEXT
    );

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.digitalText}
            // TODO [https://www.pivotaltracker.com/story/show/187668980] flow through the contributions
            contributions={[]}
        >
            <Stack>
                <Box>
                    {pages.length > 0 && loggedInWithAccess ? (
                        /**
                         * Adding a page or page content re-renders whole page due to re-rendering the
                         * page icons.  This is the same problem as with the Immersive Audio Annotator.
                         * Adding a note using the ImmersiveCreateNoteForm does not re-render the page.
                         */

                        <InteractivePagesPresenter
                            id={id}
                            pages={pages}
                            currentPageIdentifier={selectedPageIdentifier}
                            setCurrentIndex={setCurrentIndex}
                            onSubmitPageIdentifier={(pageIdentifier) => {
                                dispatch(
                                    executeCommand({
                                        type: 'ADD_PAGE_TO_DIGITAL_TEXT',
                                        payload: {
                                            aggregateCompositeIdentifier,
                                            identifier: pageIdentifier,
                                        },
                                    })
                                );
                            }}
                            onSubmitNewContent={({ text, languageCode, pageIdentifier }) =>
                                dispatch(
                                    executeCommand({
                                        type: 'ADD_CONTENT_TO_DIGITAL_TEXT_PAGE',
                                        payload: {
                                            aggregateCompositeIdentifier: {
                                                type: AggregateType.digitalText,
                                                id,
                                            },
                                            text,
                                            languageCode,
                                            pageIdentifier,
                                        },
                                    })
                                )
                            }
                        />
                    ) : (
                        <PagesPresenter
                            id={id}
                            pages={pages}
                            currentPageIdentifier={selectedPageIdentifier}
                            setCurrentIndex={setCurrentIndex}
                        />
                    )}
                </Box>
                <Box sx={{ m: 1 }}>
                    <Button
                        onClick={() => {
                            setCurrentIndex(cyclicDecrement(currentIndex, pages.length));
                        }}
                    >
                        {'<< PREV'}
                    </Button>{' '}
                    <Button
                        onClick={() => {
                            setCurrentIndex(cyclicIncrement(currentIndex, pages.length));
                        }}
                    >
                        {'NEXT >>'}
                    </Button>
                </Box>
                <Box sx={{ m: 1 }}>
                    {!isPublished ? (
                        <PublicationForm
                            onSubmitForPublication={() => {
                                dispatch(
                                    executeCommand({
                                        type: 'PUBLISH_RESOURCE',
                                        payload: {
                                            aggregateCompositeIdentifier:
                                                aggregateCompositeIdentifier,
                                        },
                                    })
                                );
                            }}
                        />
                    ) : (
                        <SinglePropertyPresenter display="Status" value="Published" />
                    )}
                </Box>
                {/* TODO [https://www.pivotaltracker.com/story/show/186539279] Include tags once we make tags event sourced */}
                <Box>
                    <CommaSeparatedList>
                        {tags.map(({ label }) => (
                            <div>{label}</div>
                        ))}
                    </CommaSeparatedList>
                </Box>
                {loggedInWithAccess ? (
                    <Box>
                        <ImmersiveCreateNoteForm
                            buttonLabel={`ADD NOTE TO PAGE ${selectedPageIdentifier}`}
                            onSubmit={(text, languageCode, noteId) => {
                                dispatch(
                                    executeCommand({
                                        type: 'CREATE_NOTE_ABOUT_RESOURCE',
                                        payload: {
                                            aggregateCompositeIdentifier: {
                                                type: AggregateType.note,
                                                id: noteId,
                                            },
                                            resourceCompositeIdentifier: {
                                                type: AggregateType.digitalText,
                                                id,
                                            },
                                            text,
                                            languageCode,
                                            resourceContext: isNonEmptyString(
                                                selectedPageIdentifier
                                            )
                                                ? {
                                                      type: 'pageRange',
                                                      pageIdentifiers: [selectedPageIdentifier],
                                                  }
                                                : { type: 'general' },
                                        },
                                    })
                                );
                            }}
                        />
                    </Box>
                ) : null}
            </Stack>
        </ResourceDetailFullViewPresenter>
    );
};
