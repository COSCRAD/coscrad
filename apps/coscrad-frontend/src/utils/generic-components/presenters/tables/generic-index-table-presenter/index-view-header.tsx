import { IBaseViewModel } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Checkbox, Typography } from '@mui/material';
import { SimulatedKeyboardConfig } from '../../../../../configurable-front-matter/data/configurable-content-schema';
import { PropertiesToSearchSelectField } from './properties-to-search-select-field';
import { SearchBar } from './search-bar';
import { HeadingLabel } from './types';

interface IndexViewHeaderProps<T extends IBaseViewModel> {
    heading: string;
    selectedFilterProperty: 'allProperties' | keyof T;
    setSelectedFilterProperty: React.Dispatch<React.SetStateAction<'allProperties' | keyof T>>;
    labelForSearchAllPropertiesOption: 'ALL';
    filterableProperties: (keyof T)[];
    headingLabels: HeadingLabel<T>[];
    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    shouldUseVirtualKeyboard: boolean;
    simulatedKeyboard: SimulatedKeyboardConfig;
    _setShouldUseVirtualKeyboard: React.Dispatch<React.SetStateAction<boolean>>;
}

export const IndexViewHeader = <T extends IBaseViewModel>({
    heading,
    headingLabels,
    selectedFilterProperty,
    setSelectedFilterProperty,
    labelForSearchAllPropertiesOption,
    filterableProperties,
    searchValue,
    setSearchValue,
    shouldUseVirtualKeyboard,
    simulatedKeyboard,
    _setShouldUseVirtualKeyboard,
}: IndexViewHeaderProps<T>): JSX.Element => {
    return (
        <>
            <Typography variant="h2">{heading}</Typography>
            <div>
                <PropertiesToSearchSelectField
                    selectedFilterProperty={selectedFilterProperty}
                    setSelectedFilterProperty={setSelectedFilterProperty}
                    labelForSearchAllPropertiesOption={labelForSearchAllPropertiesOption}
                    filterableProperties={filterableProperties}
                    headingLabels={headingLabels}
                />

                <SearchBar
                    value={searchValue}
                    onValueChange={setSearchValue}
                    specialCharacterReplacements={
                        shouldUseVirtualKeyboard
                            ? simulatedKeyboard?.specialCharacterReplacements
                            : undefined
                    }
                />
            </div>
            <div style={{ display: 'inline-flex' }}>
                <Checkbox
                    checked={shouldUseVirtualKeyboard}
                    onChange={() => _setShouldUseVirtualKeyboard(!shouldUseVirtualKeyboard)}
                />

                {!isNullOrUndefined(simulatedKeyboard) && shouldUseVirtualKeyboard ? (
                    <p>Special Character Input Method: {simulatedKeyboard.name}</p>
                ) : (
                    <p>Click to enable input method: {simulatedKeyboard.name}</p>
                )}
            </div>
        </>
    );
};
