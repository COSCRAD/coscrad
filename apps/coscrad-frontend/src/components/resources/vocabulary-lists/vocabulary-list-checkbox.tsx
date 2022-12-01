import { FormFieldType, IFormField, IValueAndDisplay } from '@coscrad/api-interfaces';
import { useState } from 'react';

type CheckboxProps = IFormField & {
    isChecked: boolean;
    onIsCheckedChange?: () => void;
};

export const VocabularyListCheckbox = ({
    type,
    name,
    options,
    isChecked: isCheckedInitially,
}: CheckboxProps): JSX.Element => {
    const [isChecked, setIsChecked] = useState<boolean>(isCheckedInitially);

    if (type !== FormFieldType.switch) {
        throw new Error(`Invalid form element type: ${type} for checkbox`);
    }

    const labelWhenChecked = (options as IValueAndDisplay<boolean>[]).find(
        ({ value }) => value === true
    )?.display;

    const labelWhenUnchecked = (options as IValueAndDisplay<boolean>[]).find(
        ({ value }) => value === false
    )?.display;

    return (
        <div>
            <input type="checkbox" name={name} onChange={() => setIsChecked(!isChecked)} />
            {isChecked ? labelWhenChecked : labelWhenUnchecked}
        </div>
    );
};
