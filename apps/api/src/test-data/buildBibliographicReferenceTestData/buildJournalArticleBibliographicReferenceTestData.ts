import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { JournalArticleBibliographicReference } from '../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/journal-article-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const dtos: DTO<JournalArticleBibliographicReference>[] = [
    {
        id: '23',
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.journalArticle,
            title: 'Report on the Cariboo Chilcotin Justice inquiry',
            creators: [
                {
                    name: 'Sigurd Purcell',
                    type: BibliographicSubjectCreatorType.author,
                },
            ],
            abstract: 'An analysis of the Cariboo Chilcotin Justice inquiry.',
            issueDate: 'Spring 2013',
            publicationTitle: 'Journal of History',
            url: 'https://search.proquest.com/docview/1682229477/abstract/7836BCEA06014582PQ/1',
            pages: '109-113,115-136,240',
            issn: '00052949',
            doi: '10.14288/bcs.v0i19.784',
        },
        published: true,
    },
    {
        id: '24',
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.journalArticle,
            title: '"INTO THAT COUNTRY TO WORK": Aboriginal Economic Activities during Barkerville\'s Gold Rush *',
            creators: [
                {
                    name: 'Mica Jorgenson',
                    type: BibliographicSubjectCreatorType.author,
                },
            ],
            abstract:
                'Drawing on Ken Martin and Mike Robinson\'s 1972 surveys of pre-contact sites and on a broad reading of secondary literature, including the work of Diamond Jenness, Adrien-Gabriel Morice, and G.R. Willey, Condrashoff argues that pit houses and salmon storage pits on Bowron Lake and at the headwaters of the Bowron River indicate "considerable use of the area" and yearround occupation rather than simply seasonal use for salmon fishing.13 Projectile points found near the storage pits appear to show attributes of the Kamloops Phase, dated approximately 1250 to 1800 CE, which suggests occupation of the site during the contact period and fur trade era and its possible abandonment shortly before or during the gold rush.',
            issueDate: 'Spring 2015',
            publicationTitle: 'BC Studies',
            url: 'https://search.proquest.com/docview/1682229477/abstract/7836BCEA06014582PQ/1',
            pages: '109-113,115-136,240',
            issn: '00052949',
        },
        published: true,
    },
    {
        id: '25',
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.journalArticle,
            title: 'KWONG LEE & COMPANY AND EARLY TRANS-PACIFIC TRADE: From Canton, Hong Kong, to Victoria and Barkerville',
            creators: [
                {
                    name: 'Tzu-I. Chung',
                    type: BibliographicSubjectCreatorType.author,
                },
            ],
            abstract:
                '[...]of the Opium Wars, Chinese use of opium became widespread, and opium became an integral (and increasingly strong) thread in the "web of empire." [...]of the gold rushes, Chinese migrants informed the cultures of the trans-Pacific world.',
            // issueDate: , OMITTED intentionally
            publicationTitle: 'BC Studies',
            url: 'https://search.proquest.com/docview/1682229425/abstract/CD9031FDCDF4B48PQ/1',
            pages: '137-151,153-154,157-158,160,239',
            issn: '00052949',
        },
        published: true,
    },
];

export default (): IBibliographicReference[] =>
    dtos.map((dto) => new JournalArticleBibliographicReference(dto));
