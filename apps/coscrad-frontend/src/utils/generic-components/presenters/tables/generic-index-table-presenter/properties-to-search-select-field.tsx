import { IBaseViewModel } from '@coscrad/api-interfaces';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { HeadingLabel } from './types';

interface PropertiesToSearchSelectFieldProps<T extends IBaseViewModel> {
    selectedFilterProperty: 'allProperties' | keyof T;
    setSelectedFilterProperty: React.Dispatch<React.SetStateAction<'allProperties' | keyof T>>;
    labelForSearchAllPropertiesOption: 'ALL';
    filterableProperties: (keyof T)[];
    headingLabels: HeadingLabel<T>[];
}

export const PropertiesToSearchSelectField = <T extends IBaseViewModel>({
    selectedFilterProperty,
    setSelectedFilterProperty,
    labelForSearchAllPropertiesOption,
    filterableProperties,
    headingLabels,
}: PropertiesToSearchSelectFieldProps<T>): JSX.Element => (
    <FormControl sx={{ minWidth: 120 }} size={'small'}>
        <InputLabel>Filter</InputLabel>
        <Select
            label={'Filter'}
            value={selectedFilterProperty}
            onChange={(changeEvent) => {
                const {
                    target: { value },
                } = changeEvent;
                setSelectedFilterProperty(value as keyof T);
            }}
        >
            <MenuItem sx={{ minWidth: 120 }} value={'allProperties'}>
                {labelForSearchAllPropertiesOption}
            </MenuItem>
            {filterableProperties.map((selectedFilterProperty: keyof T & string) => (
                <MenuItem
                    key={selectedFilterProperty}
                    value={selectedFilterProperty}
                    sx={{ minWidth: 120 }}
                >
                    {
                        headingLabels.find(
                            ({ propertyKey: labelPropertyKey }) =>
                                labelPropertyKey === selectedFilterProperty
                        )?.headingLabel
                    }
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);
