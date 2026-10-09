import { AggregateCompositeIdentifier } from '@coscrad/api-interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UnknownPart } from '../types';

export enum FeedbackTypeEnum {
    success = 'success',
    info = 'info',
    warning = 'warning',
    error = 'error',
}

export type FeedbackCommand = {
    command: {
        commandType: string;
        payload: {
            aggregateCompositeIdentifier: AggregateCompositeIdentifier;
        } & UnknownPart;
    };
};

export type FeedBack = {
    severity: FeedbackTypeEnum;
    title: string;
    feedbackMessage: string;
};

export interface FeedbackSliceState {
    open: boolean;
    feedbackCommand?: FeedbackCommand;
    feedback: FeedBack;
}

const initialState: FeedbackSliceState = {
    open: false,
    feedback: { severity: FeedbackTypeEnum.info, title: '', feedbackMessage: '' },
};

export const feedbackSlice = createSlice({
    name: 'feedback',
    initialState: initialState,
    reducers: {
        showFeedBackMessageInSnackbar: (state, action: PayloadAction<FeedBack>) => {
            state.open = true;
            state.feedback.severity = action.payload.severity;
            state.feedback.title = action.payload.title;
            state.feedback.feedbackMessage = action.payload.feedbackMessage;
        },
        hideSnackBar: (state) => {
            state.open = false;
        },
        setFeedbackCommand: (state, action: PayloadAction<FeedbackCommand>) => {
            state.feedbackCommand = action.payload;
        },
    },
});

// export const selectFeedbackCommand = (state) => state?.feedback?.feedbackCommand?.command;

export const { showFeedBackMessageInSnackbar, hideSnackBar, setFeedbackCommand } =
    feedbackSlice.actions;
