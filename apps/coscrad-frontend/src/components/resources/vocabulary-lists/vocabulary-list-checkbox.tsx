import { FormFieldType, IFormField, IValueAndDisplay } from '@coscrad/api-interfaces';
import { Checkbox } from '@mui/material';

type CheckboxProps = IFormField & {
    onIsCheckedChange?: (name: string, value: string | boolean) => void;
    isChecked: boolean;
};

/**
 * TODO[https://www.pivotaltracker.com/story/show/183941489]
 * We may want to add an 'indeterminate' state so that the user can have
 * the option of omitting the boolean filter altogether (more results)
 */
export const VocabularyListCheckbox = ({
    type,
    name,
    options,
    onIsCheckedChange,
    isChecked,
}: CheckboxProps): JSX.Element => {
    if (type !== FormFieldType.switch) {
        throw new Error(`Invalid form element type: ${type} for checkbox`);
    }

    const labelWhenChecked = (options as IValueAndDisplay<boolean>[]).find(
        ({ value }) => value === true
    )?.display;

    // const labelWhenUnchecked = (options as IValueAndDisplay<boolean>[]).find(
    //     ({ value }) => value === false
    // )?.display;

    return (
        <div>
            <Checkbox
                checked={isChecked}
                name={name}
                onChange={(eventData) => {
                    onIsCheckedChange(eventData.target.name, eventData.target.checked);
                }}
            />
            {labelWhenChecked}
        </div>
    );
};
