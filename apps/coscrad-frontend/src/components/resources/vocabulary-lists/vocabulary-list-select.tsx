import { IFormField, IValueAndDisplay } from '@coscrad/api-interfaces';
import { InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';

const NO_SELECTION_PLACEHOLDER = '-';

export const VocabularyListSelect = ({ name, options, label }: IFormField): JSX.Element => {
    const [currentValue, setCurrentValue] = useState<string>(null);

    const menuItems = options as IValueAndDisplay<string>[];

    return (
        <div>
            <InputLabel>{name}</InputLabel>
            <Select
                value={currentValue}
                label={label}
                onChange={(changeEvent) => setCurrentValue(changeEvent.target.value)}
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
