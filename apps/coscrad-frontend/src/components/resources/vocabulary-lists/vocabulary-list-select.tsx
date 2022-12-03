import { IFormField, IValueAndDisplay } from '@coscrad/api-interfaces';
import { MenuItem, Select } from '@mui/material';
import { useState } from 'react';

const NO_SELECTION_PLACEHOLDER = '-';

interface VocabularyListSelectProps {
    formField: IFormField;
    onNewSelection?: (name: string, value: string | boolean) => void;
}

export const VocabularyListSelect = ({
    formField: { name, options, label },
    onNewSelection,
}: VocabularyListSelectProps): JSX.Element => {
    const [currentValue, setCurrentValue] = useState<string>(null);

    const menuItems = options as IValueAndDisplay<string>[];

    return (
        <div>
            {label}
            <Select
                value={currentValue}
                label={label}
                name={name}
                onChange={(changeEvent) => {
                    onNewSelection(changeEvent.target.name, changeEvent.target.value);
                    setCurrentValue(changeEvent.target.value);
                }}
            >
                {[<MenuItem value={null}>{NO_SELECTION_PLACEHOLDER}</MenuItem>].concat(
                    ...menuItems.map(({ display: label, value }) => (
                        <MenuItem value={value}>{label}</MenuItem>
                    ))
                )}
            </Select>
        </div>
    );
};
