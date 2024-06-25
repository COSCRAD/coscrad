import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IDigitalTextViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Button } from '@mui/material';
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
import { PublicationForm } from './page-publication-form';
import { PagesPresenter } from './pages-presenter';

export const DigitalTextDetailFullViewPresenter = ({
    id,
    title: name,
    pages,
    isPublished,
    tags,
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
            {pages.length > 0 ? (
                /**
                 * Adding a page or page content re-renders whole page due to re-rendering the
                 * page icons.  This is the same problem as with the Immersive Audio Annotator.
                 * Adding a note using the ImmersiveCreateNoteForm does not re-render the page.
                 */

                <PagesPresenter
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
            ) : null}
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
            {!isPublished ? (
                <PublicationForm
                    onSubmitForPublication={() => {
                        dispatch(
                            executeCommand({
                                type: 'PUBLISH_RESOURCE',
                                payload: {
                                    aggregateCompositeIdentifier: aggregateCompositeIdentifier,
                                },
                            })
                        );
                    }}
                />
            ) : (
                <SinglePropertyPresenter display="Status" value="Published" />
            )}
            <br />
            {/* TODO [https://www.pivotaltracker.com/story/show/186539279] Include tags once we make tags event sourced */}
            <CommaSeparatedList>
                {tags.map(({ label }) => (
                    <div>{label}</div>
                ))}
            </CommaSeparatedList>
            <br />
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
                                resourceContext: isNonEmptyString(selectedPageIdentifier)
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
        </ResourceDetailFullViewPresenter>
    );
};
