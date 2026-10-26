import { FeedBack, FeedbackTypeEnum, showFeedBackMessageInSnackbar } from '../shared/store';
import { transformApiError } from './transform-api-error';

export const triggerAlertWithError = (dispatch, state, error) => {
    const commandPayloads = state?.feedbackSlice?.feedbackCommands;

    console.log(`Error attempting to submit spatial feature: ${JSON.stringify(commandPayloads)}`);

    const apiErrorMessage: string = transformApiError(error);

    const feedback: FeedBack = {
        severity: FeedbackTypeEnum.error,
        // This message will change if more spatial feature commands are added
        title: 'Error - Adding Spatial Feature',
        feedbackMessage: apiErrorMessage,
    };

    dispatch(showFeedBackMessageInSnackbar(feedback));
};
