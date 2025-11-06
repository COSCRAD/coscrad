export interface PaginatedResponse<T> {
    entities: T[];
    page: number;
    /**
     * This is the number of total results matching the user-provided filters.
     */
    count: number;
}
