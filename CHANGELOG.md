# COSCRAD/coscrad Change Log

## v0.1.0.beta1

### Literal translation of terms

It is now possible to provide a literal translation of a term. This will be distinguished from a free translation in the UX.

Currently, you can only provide a literal or a free translation of a term into a given translation language (typically English), but in the future, we will support both.

#### Relevant Commits

-   3bc480f3 feat: introduce PROVIDE_LITERAL_TRANSLATION_OF_TERM (#741)

### Digital text query optimization

While the backend has supported adding digital texts for some time, we haven't published this feature. We first wanted to ensure that the queries are fast. This is especially important given the amount of audio and number of photographs that typically appears in a digital text.

With this release, digital texts can be made available as a resource in a web-of-knowledge instance.

Note that currently when adding a media item (e.g. audio or photograph) to a digital text or one of its pages the media item will inherit the access control list \ publication status of the given digital text. In a future release, the visiblity of the
media resource will be maintained within the context of a digital text. So for example, an admin user would see private images that have been added to a digital text page, but a public user simply be unaware that there is a photograph for the given page.

#### Relevant Commits

-   9588ef97 feat: introduce event consumer for PAGES_IMPORTED_TO_DIGITAL_TEXT (#740)
-   74f1d539 feat: introduce event consumer for AUDIO_ADDED_FOR_DIGITAL_TEXT_TITLE (#734)
-   f9114633 introduce event consumer for COVER_PHOTOGRAPH_ADDED_FOR_DIGITAL_TEXT (#731)
-   932c5166 introduce event consumer for AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE (#733)
-   c200a1f3 feat: introduce event consumer for DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED (#730)
-   a9defdbb feat: introduce event consumer for PHOTOGRAPH_ADDED_TO_DIGITAL_TEXT_PAGE (#725)
-   12ca34f7 introduce event consumer for CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE (#728)
-   ccdf740b infra: add digital text specific methods to the query repository (#721)
-   0df761eb feat: introduce event consumer for PAGE_ADDED_TO_DIGITAL_TEXT (#726)
-   68cbb8e8 introduce event consumer for DIGITAL_TEXT_TITLE_TRANSLATED (#724)
-   9f21c590 introduce event consumer for DIGITAL_TEXT_CREATED (#720)
-   df8eecd4 refactor: leverage new approach for digital text queries (#717)
-   3585ce56 feat: introduce event consumer for RESOURCES_CONNECTED_WITH_NOTE (#713)

### Search resources by tag (in progress)

Currently, we support tagging any resource or note, as well as relabelling tags.

We are working to optimize tag queries currently and this will allow us to provide
users with the ability to search all resources and notes globally by tag in an
upcoming release.

#### Relevant Commits

-   10fdedb0 infra: introduce Arango tag query repository (#735)
-   286f71d7 feat: introduce event consumer for TAG_CREATED (#742)

### Configurable landing page

There is no consensus on what the landing page should be for the web client. As such, we have made this configurable.

#### Relevant Commits

-   0c410b3e feat(coscrad-frontend): make landing page configurable (#738)

### Audio discovery for terms (admin utilities)

With this release, we have added the first iteration of a tool that helps admin automate linking large amounts of imported audio with imported terms.

#### Relevant Commits

-   f2c3604a CWE bjira 131 cli command discover audio for terms (#729)
-   b18a8491 feat: support partial matches when discovering audio for terms (#727)
-   9f6c434c feat: discover audio for terms (#719)
-   71e21e12 feat: support contribution tracking in media ingestion flow (#723)

### Dynamic credits

Our system tracks every change that is made to a resource and maintains an append-only log of such changes, similar to an accounting system. One nice benefit of this is that we can use this event history to provide credit to contributors of information and data processing for a given resource. This shows up as "Contributors" in the UX.

Because there are still contributions that are not fully captured within the workflow that is tracked by the system, users can also provide additional credits manually as needed.

#### Relevant Commits

-   6f6b74f1 feat: introduce event consumer for ADDITIONAL_CREDITS_PROVIDED_FOR_RESOURCE (#716)
-   45f95424 feat: reword attribution for prompt term events (#714)
-   9dab6762 feat: introduce PROVIDE_ADDITIONAL_CREDITS_FOR_RESOURCE (#699)
-   7c8f96b4 feat: dynamically generate attributions from a resources event history (#688)
-   39b54c6a feat: flow contributions to terms (#598)
-   32d44fba feat: support contributions in resource views (#591)

### UX Enhancements for the Digtal Phrasebook (Terms and Vocabulary Lists)

We have made enhancements to the presentation of vocabulary lists. We have also added additional information, including displaying the list of vocabulary lists a given terms appears in when viewing a term or searching terms. This is especially helpful in cases where translations of terms in a vocabulary list is to be inferred from the English name of said vocabulary list.

#### Relevant Commits

-   39323a2c feat(coscrad-frontend): introduce flat multilingual text presenter (#711)
-   106abafb feat: expose vocabulary lists on term views (#705)
-   3d6cc2f3 feat: expose vocabulary lists on term views (#654)
-   964a216c test(api): expand vocabulary list fetch many queries test (#641)
-   fdaad45b test(e2e): add Cypress test for vocabulary list detail query flow (#638)
-   204cd0ac feat(coscrad-frontend): support language specific filtering of index tables (#587)
-   b5ea427d feat(api): support vocabulary list registration in query layer (#611)
-   2428a37c refactor(api): event source term views 187921781 (#604)

### Search terms by letter

You can now search Chilcotin terms by letter. So for example, searching for "d" will find "deldon" but not "dlɨg". Searching for "dl" will find "dlɨg" but not "deldon".

In order to do this, we implemented a custom parser for Chilcotin. In the future, we will support additional languages by demand. In the future, searching by letter will extend to all multilingual text in the system and be part of the full text
search feature.

#### Relevant Commmits

-   d20b60fb fix: support lone surrogate representation of complex capped consonants (#718)
-   1a915e45 feat: enable users to search terms by letter (#715)
-   b1c51d91 feat: support raw data on create prompt term payload (#686)
-   90775c2a feat: support parsing Chilcotin letters atomically from text fields (#685)

### Data import tools and optimizations

Some COSCRAD adopters have extensive semi-structured data sets including spreadsheets, legacy databases, systematically named media files, books, and slides. A lot of our preprocessing tooling is written in [a second Python repo](https://github.com/COSCRAD/data-ingestion), with its own CHANGELOG. We also provide a command line binding (`coscrad-cli`) to assisst with bulk ingestion jobs.

In the process of using the CLI to import data, we have hit the need to optimize the validation for several commands.

#### Relevant Commits

-   54dfb92e refactor: optimize prompt term command flow (#702)
-   33a5d9e6 refactor: optimize IMPORT_ENTRIES_TO_VOCABULARY_LIST (#708)
-   dc148e6f refactor: optimize IMPORT_AUDIO_ITEMS_TO_PLAYLIST (#712)
-   b13f78ed refactor: remove unnecessary state retrieval when validating CREATE_TERM (#662)
-   f564c7fe feat(data): make **data-exporter** more robust (#652)
-   e239b6e7 feat(cli): make publication optional for **ingest-media-items** (#663)
-   4e22095f refactor(api): optimize event queries (#621)
-   581e1fe3 feat(api): introduce IMPORT_PAGES_TO_DIGITAL_TEXT (#602)
-   cbaeafd2 feat(api): introduce IMPORT_ENTRIES_TO_VOCABULARY_LIST (#597)
-   fd7a6066 refactor: make performance enhancements for data ingestion (#595)
-   b587bbbe feat(api): support .mov files in media ingestion flow (#588)

### Song, audio item, playlist, and video query optimizations

Prior to importing large amounts of songs, audio items, or videos, it is important to apply a standard optimization procedure to make the queries fast.

#### Relevant Commits

-   b22f62ec refactor: optimize song queries (#710)
-   a4b9667e feat: introduce event consumer for NOTE_ABOUT_RESOURCE_CREATED (#704)
-   84663ba9 refactor: leverage dedicated query database for audio item queries (#703)
-   b43f95d3 feat: introduce event consumer SONG_LYRICS_TRANSLATED (#701)
-   44912852 feat: introduce event consumer for LYRICS_ADDED_FOR_SONG (#700)
-   b4ae2f66 feat: introduce event consumer for RESOURCE_OR_NOTE_PUBLISHED (#695)
-   7f3b0c74 fix: introduce attribution event consumer as temporary workaround (#698)
-   b7061e64 feat: introduce event consumer for SONG_TITLE_TRANSLATED (#697)
-   ac43af0c feat: introduce event consumer for SONG_CREATED (#696)
-   50076bc2 feat: support videos in transcription event consumers (#691)
-   735a909f infra: introduce song query repository (#692)
-   8e4b5b41 feat: introduce event consumer for VIDEO_NAME_TRANSLATED (#690)
-   b180f20f feat: introduce event consumer for VIDEO_CREATED (#689)
-   4aa2bc54 infra: introduce arango video query repository (#687)
-   8b07cad9 feat: introduce event consumer for AUDIO_ITEMS_IMPORTED_TO_PLAYLIST (#684)
-   a8be740c feat: introduce event consumer for TRANSLATIIONS_IMPORTED_FOR_TRANSCRIPT (#683)
-   d44db60b feat: introduce event consumer for LINE_ITEM_TRANSLATED (#681)
-   301e4292 feat: introduce event consumer for PLAYLIST_NAME_TRANSLATED (#682)
-   8b7c575f feat: introduce event consumer for LINE_ITEMS_IMPORTED_TO_TRANSCRIPT (#679)
-   8b24682f feat(mobile-alphabet): add startup loading screen image (#677)
-   649e83a4 introduce event consumer for LINE_ITEM_ADDED_TO_TRANSCRIPT (#676)
-   14cafa34 refactor: introduce general pattern matching for event consumers (#647)
-   0fc7f375 feat: introduce event consumer for PARTICIPANT_ADDED_TO_TRANSCRIPT (#673)
-   571f3fba feat: introduce event consumer for TRANSCRIPT_CREATED (#670)
-   3236544b feat: introduce event consumer for AUDIO_ITEM_NAME_TRANSLATED (#669)

### Photgraphs as resources

Photographs are now available to be used as a third kind of media resource (along with audio and video resources). For the purposes of notes and connections, these can be contextualized by polygons indicating a relevant region of the photograph.

#### Relevant Commits

-   ce6be64c test(e2e): add cypress tests for photograph index-to-detail flow (#660)
-   e12cf69e refactor(api): event source photograph views (#640)

### Playlists

Playlists organize audio items into playlists for a web radio like experience. In the future, other resources (e.g. videos, vocabulary lists) may be used as playlist items.

#### Relevant Commits

-   4bf839c4 perf: optimize playlist queries (#672)

### Mobile client

We would like to eventually support all features of the web-of-knowledge web platform in a mobile client with offline capability, subject to interest and resources. At present, we have ported the alphabet to a mobile app.

Note that for technical reasons, we will be migrating our mobile client to a separate project with its own release notes in the future.

#### Relevant Commits

-   3f1f5c2b feat(mobile-alphabet): support configurable credits screen (#653)

### Additional Infrastructure

There is always some work that is opaque to users, but prerequisite to building out new features. Such is the case with the following work.

#### Relevant Commits

-   4e4cdd2d feat(api): dynamically configure allowed origins (#666)
-   5b236b43 refactor(api): move media ingestion to the media service (#649)
-   5cf931df refactor: isolate vertical slice for media item module (#648)
-   426cc954 refactor: avoid high-level references to view collection names (#642)
-   01676668 refactor(api): simplify event handlers (#625)
-   7dd1d9f9 feat(api): publish events in command handlers (#623)
-   a8e40ccf feat(data-types): append class name to nested data type metadata (#592)
-   eab9c2ab feat(coscrad-frontend): add map view to spatial feature detail full view (#596)
-   74bb6769 feat(api): introduce UNPUBLISH_RESOURCE (#600)
-   380cc4bd Enhance song views 187564350 (#586)
-   91bee25b migration(5): migrate events from legacy snapshot collections (#693)
-   98c08356 infra(api): opt in to event sourced command repos (#680)

### Web Alphabet App

Our previous iteration of the interactive alphabet chart was a one-off project external to the core platform. We have now modernized this as part of the COSCRAD plaform. In the future, we will integrate the alphabet chart with the "search by letter" and "full text search" features, so that the alphabet can serve as an entry point into the web-of-knowledge.

We have also ported this feature to the new mobile client.

#### Relevant Commits

-   6e1bb50d style(coscrad-frontend): style alphabet cards (#620)
-   19db1b43 test(coscrad-frontend): add UX test for alphabet (#617)
-   a961e7dd feat(coscrad-frontend): introduce alphabet chart (#614)
-   d8ccac6d refactor(api): optimize media item queries by name (#613)
-   bcc01f1a feat(api): define filename and filetype in binary downloads (#619)

### Note enhancements

Users can now add audio and translate notes. This makes it possible to create a web-of-knowledge where the notes and connections are in the language!

#### Relevant Commits

-   1e789c59 feat(coscrad-api): introduce ADD_AUDIO_FOR_NOTE (#589)
-   dff3beed feat(api): introduce TRANSLATE_NOTE (#582)

### Support for Additional Materials

Sometimes users have materials that do not fit the mold for the available resource types. In this case, we support adding additional materials that can include audio, video, and PDF documents along with a description.

We also now support a curratable list of links to external language resources on the web.

#### Relevant Commits

-   a99c24da feat(coscrad-frontend): support additional materials (#618)
-   5d541e13 feat(coscrad-frontend): include external links page (#610)

### Bug Fixes

#### Relevant Commits

-   1999a191 fix: make attributor specific to resources (#732)
-   84a4eebc fix(api): fix response mapping for empty index queries (#722)
-   b5ea26cb fix: make additional resources robust to incomplete items (#709)
-   19c4fd19 fix: register handler for PROVIDE_ADDITIONAL_CREDITS_FOR_RESOURCE (#707)
-   0eccdcb1 fix(media-player): add missing space for dynamic content in listen live view (#678)
-   79bd2d49 fix: sort alphabet cards on the backend (#675)
-   4768ce55 refactor: introduce single source of truth for persistence upon command success (#674)
-   cdc015eb fix: make playlist media item URLs absolute (#667)
-   caae1894 fix(cli): support UUIDs in **execute-command-stream** (#665)
-   30cc099e fix(media-management): make correction to ogg MIME type (#664)
-   6fae4613 fix(arango): ensure event documents are sorted (#661)
-   299f0e9d fix: respect query ACL of terms in vocabulary lists (#637)
-   8291d5f1 fix: support command form generation in the query layer for the phrasebook work flow (#628)
-   9bb45e76 fix(api): restore vocabulary list command forms (#626)
-   b211168a fix(api): restore term command forms in query layer (#622)
-   a236a16c fix(api): return proper not found response for legacy game data queries (#616)
-   5dff2161 fix(api): handle null checks on user in media queries (#615)
-   d459e26b fix(media-player): explicitly load audio in audio clip player to support Safari (#601)

<!-- beginning of time February 26, 2025 -->
<!-- 86166473 feat(api): introduce **audio-lineages** and support -->

## v0.0.1.alpha

We did not maintain a change log prior to February 26, 2025. At this point, the platform was still considered a work-in-progress.

Key features from the Alpha stage include

-   Introduction of infrastructure for validating commands and persisting state changes
-   Introduction of the core features of the web-of-knowledge platform, including:
    -   Contextualized notes and connections and associated validation
    -   Global tags for resources and notes (collectively "categorizables")
    -   A draft model for a hierarchical "category tree", which compliments flat tags
    -   A highly configurable web client with dynamic command forms for admin operations and a "big index-to-detail flow" to search resources
-   A Rest API binding for commands and queries, along with separate "view models" optimized for queries
-   Row-level read Access Control Lists as well as a publication system and role-based authentication for priviliged read and all write access
-   A command-line binding, `coscrad-cli`, and core tooling for media ingestion and other bulk import jobs
-   Tooling to manage data model schemas and associated validation
-   A persistence layer for an append-only event history as well as snapshots and CRUD models, implemented with ArangoDB
-   Basic media management
-   Tooling for continuous migrations
-   Tools for managing comprehensive test \ staging data
