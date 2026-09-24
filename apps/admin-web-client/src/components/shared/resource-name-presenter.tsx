import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined, isString } from '@coscrad/validation-constraints';
import { Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { MultilingualTextPresenter } from './multilingual-text-presenter';

interface ResourceNamePresenterProps {
    name: IMultilingualText | string;
    variant: Variant;
}

export const ResourceNamePresenter = ({
    name,
    variant,
}: ResourceNamePresenterProps): JSX.Element => {
    return (
        <Typography
            gutterBottom
            component="span"
            variant={variant}
            fontWeight="bold"
            color="primary"
        >
            {isString(name) || isNullOrUndefined(name) ? (
                name
            ) : (
                <MultilingualTextPresenter text={name} />
            )}
        </Typography>
    );
};
