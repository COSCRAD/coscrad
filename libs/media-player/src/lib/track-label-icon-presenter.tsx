import styled from '@emotion/styled';
import { Comment as CommentIcon, QuestionAnswer as QuestionAnswerIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

const StyledIconButton = styled(IconButton)({ color: '#666' });

interface TrackLabelIconPresenterProps {
    trackLabel: string;
}

export const TrackLabelIconPresenter = ({ trackLabel }: TrackLabelIconPresenterProps) => {
    const selectedIcon = trackLabel === 'Annotations' ? <CommentIcon /> : <QuestionAnswerIcon />;

    return (
        <Tooltip title={trackLabel}>
            <span>
                <StyledIconButton data-testid="track-label-icon">{selectedIcon}</StyledIconButton>
            </span>
        </Tooltip>
    );
};
