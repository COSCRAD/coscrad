import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IDigitalTextViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { executeCommand } from '../../../store/slices/command-status';
import {
    CommaSeparatedList,
    ResourceDetailFullViewPresenter,
} from '../../../utils/generic-components';
import { cyclicDecrement, cyclicIncrement } from '../../../utils/math';
import { ImmersiveCreateNoteForm } from './immersive-create-note-form';
import { NewPageForm } from './new-page-form';
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

    const allExistingPageIdentifiers = pages.map(({ identifier }) => identifier);

    const aggregateCompositeIdentifier = {
        type: AggregateType.digitalText,
        id,
    };

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.digitalText}>
            {pages.length > 0 ? (
                // TODO Offer multiple views here
                <PagesPresenter
                    pages={pages}
                    currentPageIdentifier={selectedPageIdentifier}
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
            {/* TODO I am a back-end developer */}
            <br />
            <NewPageForm
                existingPageIdentifiers={allExistingPageIdentifiers}
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
            />
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
                <Typography variant="body2">Published</Typography>
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
