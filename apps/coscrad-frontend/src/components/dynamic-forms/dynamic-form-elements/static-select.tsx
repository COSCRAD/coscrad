import { IFormField, IValueAndDisplay } from '@coscrad/api-interfaces';
import { FormGroup, MenuItem, Select } from '@mui/material';
import { useState } from 'react';

const NO_SELECTION_PLACEHOLDER = '-SELECT-';

interface VocabularyListSelectProps {
    formField: IFormField;
    onNewSelection?: (name: string, value: string | boolean) => void;
}

export const StaticSelect = ({
    formField: { name, options, label },
    onNewSelection,
}: VocabularyListSelectProps): JSX.Element => {
    const [currentValue, setCurrentValue] = useState<string>(null);

    const menuItems = options as IValueAndDisplay<string>[];

    return (
        <FormGroup>
            {label}
            <Select
                value={currentValue || ''}
                label={label}
                name={name}
                onChange={(changeEvent) => {
                    onNewSelection(changeEvent.target.name, changeEvent.target.value);
                    setCurrentValue(changeEvent.target.value);
                }}
            >
                {[
                    <MenuItem value={null} key={'0'}>
                        {NO_SELECTION_PLACEHOLDER}
                    </MenuItem>,
                ].concat(
                    ...menuItems.map(({ display: label, value }) => (
                        <MenuItem key={`${label}-${value}`} value={value}>
                            {label}
                        </MenuItem>
                    ))
                )}
            </Select>
        </FormGroup>
    );
};
