enum BibliographicSubjectCreatorType {
    author = 'author',
    director = 'director',
    artist = 'artist',
}

export interface IBibliographicCitationCreator {
    name: string;
    type: BibliographicSubjectCreatorType;
}
