import { Typography } from '@mui/material';
import { isEmptyText } from './isEmptyText';

interface BilingualTextPresenterProps {
    textInPrimaryLanguage: string;
    textInSecondaryLanguage: string;
}

export const BilingualTextPresenter = ({
    textInPrimaryLanguage,
    textInSecondaryLanguage,
}: BilingualTextPresenterProps): JSX.Element => {
    if (isEmptyText(textInSecondaryLanguage))
        return (
            <Typography component="span" variant="h6">
                {textInPrimaryLanguage}
            </Typography>
        );

    return (
        <Typography component="span" variant="body1">
            <Typography component="span" variant="h6">
                {textInPrimaryLanguage}
            </Typography>{' '}
            ({textInSecondaryLanguage})
        </Typography>
    );
};
