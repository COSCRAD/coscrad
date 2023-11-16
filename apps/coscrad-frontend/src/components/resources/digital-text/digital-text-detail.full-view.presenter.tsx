import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IDigitalTextViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { executeCommand } from '../../../store/slices/command-status';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components';
import { cyclicDecrement, cyclicIncrement } from '../../../utils/math';
import { NewPageForm } from './new-page-form';
import { PagesPresenter } from './pages-presenter';

export const DigitalTextDetailFullViewPresenter = ({
    id,
    title: name,
    pages,
}: ICategorizableDetailQueryResult<IDigitalTextViewModel>): JSX.Element => {
    const dispatch = useAppDispatch();

    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const selectedPageIdentifier = pages.length > 0 ? pages[currentIndex].identifier : undefined;

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.digitalText}>
            {pages.length > 0 ? (
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
                onSubmitPageIdentifier={(pageIdentifier) => {
                    dispatch(
                        executeCommand({
                            type: 'ADD_PAGE_TO_DIGITAL_TEXT',
                            payload: {
                                aggregateCompositeIdentifier: {
                                    type: AggregateType.digitalText,
                                    id,
                                },
                                identifier: pageIdentifier,
                            },
                        })
                    );
                }}
            />
        </ResourceDetailFullViewPresenter>
    );
};
