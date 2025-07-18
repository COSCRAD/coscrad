import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateType,
    IAudioItemViewModel,
    ITagViewModel,
    ITermViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../../../app/hooks';
import { executeCommand } from '../../../../store/slices/command-status';
import { useLoadableAudioItems, useLoadableTerms } from '../../../../store/slices/resources';
import { ErrorDisplay } from '../../../error-display/error-display';
import { Loading } from '../../../loading';
import { AudioItemDetailFullViewPresenter } from '../../audio-item/audio-item-detail.full-view.presenter';
import { TermDetailFullViewPresenter } from '../term-detail.full-view.presenter';

interface AudioSelectionPanelProps {
    term: ITermViewModel;
    relevantAudios: (IAudioItemViewModel & { tags: ITagViewModel[] })[];
}

const AudioSelectionPanel = ({
    term: { id: termId },
    relevantAudios,
}: AudioSelectionPanelProps) => {
    const [isActive, setIsActive] = useState(true);

    const dispatch = useAppDispatch();

    const addAudio = (audioItemId: string) => {
        dispatch(
            executeCommand({
                type: 'ADD_AUDIO_FOR_TERM',
                payload: {
                    [AGGREGATE_COMPOSITE_IDENTIFIER]: {
                        type: AggregateType.term,
                        id: termId,
                    },
                    audioItemId,
                    // TODO make this selectable
                    languageCode: LanguageCode.Chilcotin,
                },
            })
        );
    };

    const publishTerm = (termId: string) => {
        dispatch(
            executeCommand({
                type: 'PUBLISH_RESOURCE',
                payload: {
                    [AGGREGATE_COMPOSITE_IDENTIFIER]: {
                        type: AggregateType.term,
                        id: termId,
                    },
                },
            })
        );
    };

    if (relevantAudios.length === 0) {
        return null;
    }

    return (
        <Box>
            {relevantAudios.map((a) => (
                <Box>
                    <AudioItemDetailFullViewPresenter {...a} />
                    <Button
                        onClick={() => {
                            console.log('CLICCCCCCCK');

                            addAudio(a.id);

                            publishTerm(termId);

                            // prevent multiple submission
                            // setIsActive(false);
                        }}
                        disabled={!isActive}
                    >
                        Add Audio for Term (is active: {isActive ? 'T' : 'f'})
                    </Button>
                </Box>
            ))}
        </Box>
    );
};

export const DiscoverAudioForTermsPage = (): JSX.Element => {
    const termLoadResult = useLoadableTerms();

    const audioLoadResult = useLoadableAudioItems();

    const isLoading =
        termLoadResult.isLoading ||
        audioLoadResult.isLoading ||
        termLoadResult.data === null ||
        audioLoadResult.data === null;

    const errorInfo = termLoadResult.errorInfo || audioLoadResult.errorInfo;

    if (isLoading) {
        return <Loading />;
    }

    if (errorInfo) {
        return <ErrorDisplay {...errorInfo} />;
    }

    const { entities: terms } = termLoadResult.data;

    const { entities: audios } = audioLoadResult.data;

    return (
        <Box>
            Discover Audio! {terms.length}
            {terms
                .filter(
                    ({ name }, index) =>
                        name.items.some(
                            ({ text }) =>
                                text === 'Lha taniŝtl’un talilh nentsel bajinadetezasdelh.'
                        ) || index < 10
                )
                .map((term) => {
                    const { possibleAudioFilenames } = term;

                    const relevantAudios = audios.filter(({ name }) => {
                        return name.items.some(({ text }) =>
                            possibleAudioFilenames.some((p) =>
                                text.toLowerCase().includes(p.toLowerCase())
                            )
                        );
                    });

                    return (
                        <Box>
                            <TermDetailFullViewPresenter {...term} />
                            <AudioSelectionPanel term={term} relevantAudios={relevantAudios} />
                        </Box>
                    );
                })}
        </Box>
    );
};
