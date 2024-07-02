import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IDigitalTextViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { executeCommand } from '../../../store/slices/command-status';
import {
    CommaSeparatedList,
    ResourceDetailFullViewPresenter,
    SinglePropertyPresenter,
} from '../../../utils/generic-components';
import { ImmersiveCreateNoteForm } from '../shared/immersive-create-note-form';
import { PageDetailNavigation } from './page-detail-navigation';
import { PublicationForm } from './page-publication-form';
import { PagesPresenter } from './pages-presenter';

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

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.digitalText}
            // TODO [https://www.pivotaltracker.com/story/show/187668980] flow through the contributions
            contributions={[]}
        >
            {/* /**
             * Adding a page or page content re-renders whole page due to re-rendering the
             * page icons.  This is the same problem as with the Immersive Audio Annotator.
             * Adding a note using the ImmersiveCreateNoteForm does not re-render the page.
             */}
            {/* {actions.some(({ type: commandType }) => commandType === CREATE_NOTE_ABOUT_RESOURCE) ? ( */}
            <Stack>
                <Box sx={{ mb: 1 }}>
                    <PagesPresenter
                        compositeIdentifier={aggregateCompositeIdentifier}
                        pages={pages}
                        currentPageIdentifier={selectedPageIdentifier}
                        setCurrentIndex={setCurrentIndex}
                        onSubmitPageIdentifier={
                            actions.length > 0
                                ? (pageIdentifier) =>
                                      dispatch(
                                          executeCommand({
                                              type: 'ADD_PAGE_TO_DIGITAL_TEXT',
                                              payload: {
                                                  aggregateCompositeIdentifier,
                                                  identifier: pageIdentifier,
                                              },
                                          })
                                      )
                                : null
                        }
                        onSubmitNewContent={
                            actions.length > 0
                                ? ({ text, languageCode, pageIdentifier }) =>
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
                                : null
                        }
                    />
                </Box>
                {pages.length > 0 ? (
                    <>
                        <PageDetailNavigation
                            currentIndex={currentIndex}
                            pagesLength={pages.length}
                            setCurrentIndex={setCurrentIndex}
                        />
                        <Box sx={{ mb: 1 }}>
                            {!isPublished && actions.length > 0 ? (
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
                        <Box sx={{ mb: 1 }}>
                            <CommaSeparatedList>
                                {tags.map(({ label }) => (
                                    <div>{label}</div>
                                ))}
                            </CommaSeparatedList>
                        </Box>
                        {actions.length > 0 ? (
                            <Box sx={{ mb: 1 }}>
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
                                                              pageIdentifiers: [
                                                                  selectedPageIdentifier,
                                                              ],
                                                          }
                                                        : { type: 'general' },
                                                },
                                            })
                                        );
                                    }}
                                />
                            </Box>
                        ) : null}
                    </>
                ) : null}
            </Stack>
        </ResourceDetailFullViewPresenter>
    );
};
