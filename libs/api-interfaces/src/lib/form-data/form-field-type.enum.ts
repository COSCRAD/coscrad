export enum FormFieldType {
    textField = 'TEXT_FIELD',
    numericInput = 'NUMERIC_INPUT',
    /**
     * This is an input for raw data. It can also be used as a makeshift field
     * for what will later become dynamic select elements.
     */
    jsonInput = 'JSON_INPUT',
    yearPicker = 'YEAR_PICKER',
    staticSelect = 'STATIC_SELECT', // Corresponds to a dropdown
    switch = 'SWITCH', // Corresponds to a switch
    dynamicSelect = 'DYNAMIC_SELECT',
    multilingualText = 'MULTILINGUAL_TEXT',
}
