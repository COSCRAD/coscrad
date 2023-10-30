// TODO Leverage this
export interface IAggregateQueryRepository<T> {
    fetchById(id: string): Promise<T>;
}
