export interface ISpecification<T> {
    forAQL(docName: string): () => string;

    isSatisfiedBy(T): boolean;
}
