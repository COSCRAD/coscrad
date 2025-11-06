export type TypeDecoratorOptions = {
    isOptional?: boolean;

    isArray?: boolean;

    // Marks this property as not available to the public
    isPrivate?: boolean;

    label: string;

    description: string;
};
