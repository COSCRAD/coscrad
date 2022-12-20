import { IFormField, IValueAndDisplay } from '@coscrad/api-interfaces';
import { FormGroup, MenuItem, Select } from '@mui/material';
import { useState } from 'react';

// TODO Make this configurable
const NO_SELECTION_PLACEHOLDER = '-SELECT-';

interface VocabularyListSelectProps {
    formField: IFormField;
    onNewSelection?: (name: string, value: string | boolean) => void;
    initialValue?: string;
}

export const StaticSelect = ({
    formField: { name, options, label },
    onNewSelection,
    initialValue,
}: VocabularyListSelectProps): JSX.Element => {
    const [currentValue, setCurrentValue] = useState<string>(null);

    const menuItems = options as IValueAndDisplay<string>[];

    return (
        <FormGroup>
            <Select
                value={currentValue || initialValue || ''}
                label={label}
                name={name}
                onChange={(changeEvent) => {
                    onNewSelection(changeEvent.target.name, changeEvent.target.value);
                    setCurrentValue(changeEvent.target.value);
                }}
            >
                {/* Include a null selection placeholder to represent unselected state */}
                {[
                    <MenuItem value={null} key={'0'}>
                        {NO_SELECTION_PLACEHOLDER}
                    </MenuItem>,
                ].concat(
                    // Create one select menu item for each option
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
