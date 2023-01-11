import { IFormField, IValueAndDisplay } from '@coscrad/api-interfaces';
import { StaticSelect } from './static-select';

// TODO Consider making this configurable
const STARTING_DATE_TO_PICK = 1491;

// TODO Share this with the validator lib
const CURRENT_YEAR = new Date().getFullYear();

interface YearPickerProps {
    formField: IFormField;
    onNewSelection: (name: string, value: string | boolean) => void;
    currentValue: number;
}

/**
 * TODO [https://www.pivotaltracker.com/story/show/184066046]
 * We need a component test for `YearPicker.
 *
 * Note that MUI has a free and paid tier for their date-picker element, which
 * is not part of their core library. We decided it was safest to simply
 * "role our own" year picker.
 */
export const YearPicker = ({
    formField: { name, label, description, type },
    onNewSelection,
    currentValue,
}: YearPickerProps): JSX.Element => {
    const numberOfOptions = CURRENT_YEAR - STARTING_DATE_TO_PICK + 1;

    const selectOptions: IValueAndDisplay<number>[] = Array(numberOfOptions)
        .fill(null)
        .map((_, index) => STARTING_DATE_TO_PICK + index)
        .map((value) => ({
            value,
            display: value.toString(),
        }));

    const formFieldForStaticSelect = {
        name,
        label,
        description,
        type,
        options: selectOptions,
        constraints: [
            {
                name: 'IS_YEAR',
                message: `Must be a valid year`,
            },
        ],
    };

    return (
        <StaticSelect
            formField={formFieldForStaticSelect}
            currentValue={currentValue?.toString() || CURRENT_YEAR.toString()}
            onNewSelection={onNewSelection}
        />
    );
};
