# Music sources and implementation policy

Revision 373 replaces the original four short game loops with the 18 arrangements accepted in `assets/music/ignatius_music_selections.json`. Accepted IDs, historical jukebox versions, and whole-octave adjustments come directly from that export. Browser verification found that its timing objects repeat template values per version, so the durations below are the tune-specific values reported by the exact embedded engine API.

The game packages no commercial recording, sampled performance, MIDI file, LilyPond file, MusicXML file, or score PDF. Playback uses synthesized browser engines embedded by `src/browser/music-engine-sources.js` and derived from `ignatius_public_domain_jukebox_v7_long_form_loops.html`. Engines 3 and 4 remain exact selector engines. Engine 2 retains the same synthesizer, instrument palette, pitches, tempo curve, and loop timing. Revision 378 made Mountain King's quiet bassoon support follow every cello melody note instead of alternating notes. Revision 379 keeps that complete support line but lowers its gain and applies a darker tune-specific filter with a gentler attack and longer decay/release, reducing the hard high-register edge without changing the bassoon identity, score, timing, or loop. The opening plays once, then playback returns to the engine-reported musical loop point indefinitely.

## Accepted runtime catalog

- **In the Hall of the Mountain King** — Edvard Grieg (1875), Orchestrated engine, original octave; live full pass 238.784s, loop point 20.521s, repeating body 218.263s. Source reference: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1888
- **March of the Dwarfs** — Edvard Grieg (1891), Natural engine, original octave; live full pass 252.632s, loop point 12.632s, repeating body 240.000s. Source reference: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2014
- **Night on Bald Mountain** — Modest Mussorgsky (1867), Natural engine, original octave; live full pass 268.545s, loop point 14.951s, repeating body 253.594s. Source reference: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1892
- **Danse macabre** — Camille Saint-Saëns (1874), Orchestrated engine, original octave; live full pass 232.727s, loop point 7.273s, repeating body 225.455s.
- **Fossils** — Camille Saint-Saëns (1886), Deep piano engine, original octave; live full pass 221.538s, loop point 3.077s, repeating body 218.462s.
- **The Elephant** — Camille Saint-Saëns (1886), Deep piano engine, -1 octave; live full pass 281.379s, loop point 8.276s, repeating body 273.103s.
- **Royal March of the Lion** — Camille Saint-Saëns (1886), Orchestrated engine, original octave; live full pass 286.452s, loop point 7.742s, repeating body 278.710s.
- **Dance of the Sugar Plum Fairy** — Pyotr Ilyich Tchaikovsky (1892), Deep piano engine, -1 octave; live full pass 257.143s, loop point 8.571s, repeating body 248.571s.
- **Toccata and Fugue in D minor** — Johann Sebastian Bach (1704), Orchestrated engine, -1 octave; live full pass 227.797s, loop point 8.136s, repeating body 219.661s.
- **Bourrée in E minor** — Johann Sebastian Bach (1712), Orchestrated engine, -1 octave; live full pass 225.455s, loop point 7.273s, repeating body 218.182s.
- **Turkish March from The Ruins of Athens** — Ludwig van Beethoven (1811), Orchestrated engine, -1 octave; live full pass 247.273s, loop point 7.273s, repeating body 240.000s.
- **Rondo alla turca** — Wolfgang Amadeus Mozart (1783), Orchestrated engine, -1 octave; live full pass 240.000s, loop point 3.333s, repeating body 236.667s.
- **Eine kleine Nachtmusik: Allegro** — Wolfgang Amadeus Mozart (1787), Orchestrated engine, -1 octave; live full pass 275.294s, loop point 7.059s, repeating body 268.235s.
- **Queen of the Night: Vengeance Aria** — Wolfgang Amadeus Mozart (1791), Orchestrated engine, original octave; live full pass 227.368s, loop point 3.158s, repeating body 224.211s.
- **Hungarian Dance No. 5** — Johannes Brahms (1869), Orchestrated engine, -1 octave; live full pass 227.368s, loop point 3.158s, repeating body 224.211s.
- **Pizzicato from Sylvia** — Léo Delibes (1876), Orchestrated engine, -2 octaves; live full pass 214.154s, loop point 7.385s, repeating body 206.769s.
- **The Entertainer** — Scott Joplin (1902), Natural engine, -1 octave; live full pass 252.632s, loop point 31.579s, repeating body 221.053s. Source reference: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=263
- **Pizzicato Polka** — Johann Strauss II & Josef Strauss (1869), Orchestrated engine, -1 octave; live full pass 276.364s, loop point 7.273s, repeating body 269.091s.

## Runtime ownership

`src/shared/music-data.js` contains stable catalog metadata, engine-measured timing, and level-selection normalization. `src/browser/music-director.js` owns game-level selection, volume, mute, pause/play, and engine switching. `src/browser/music-engine-host.js` mounts the selected jukebox engines in hidden same-origin `srcdoc` frames so ordinary hosted pages and local-file builds use the same implementation. The portable simulation retains only `music.version` and `music.tuneId`; it never creates audio nodes or advances musical time.

## Source review rule

The source URLs recorded by the selector are retained verbatim in the packaged selection JSON. Where the selector has no single source URL, the arrangement remains an independently encoded synthesis sketch of the underlying public-domain composition. Any future imported edition, transcription, sample, or recording must record its exact source and licence here before release.
