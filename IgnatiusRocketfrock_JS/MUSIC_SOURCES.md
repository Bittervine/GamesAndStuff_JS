# Music sources and implementation policy

The project packages no recordings, sampled instruments, MIDI files, LilyPond files, MusicXML files, or score PDFs. Runtime arrangements in `src/shared/music-data.js` are compact pitch-and-duration event lists authored for the game's Web Audio synthesizer. Source scores are used only to verify public-domain compositions, melody, rhythm, and metadata.

## In the Hall of the Mountain King

Revision 152 rechecked the opening four-measure theme against two independent public-domain score references:

- Edvard Grieg, *Peer Gynt Suite No. 1*, Op. 46, Edition Peters plate 9563, page 16. IMSLP hosts a scan of the published score: https://s9.imslp.org/files/imglnks/usimg/c/ca/IMSLP66080-PMLP02533-Grieg_Peer_Gynt_Suite_I_Op_46_Peters_9563.pdf
- Edvard Grieg, *In the Hall of the Mountain King*, Op. 46 No. 4. Mutopia identifies its engraving as public domain, based on a 1918 University Society source, and provides score and LilyPond downloads: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1888

Both references show the same opening pitch and rhythm pattern. The game now encodes the four measures as:

`B C# D E F# D F# | E# C# E# E C E | B C# D E F# D F# B | A F# D F# A`

Quarter- and half-note holds are preserved in the event timing. The compact game loop then restates that verified phrase a perfect fifth higher. This is a deliberately shortened game arrangement, not a claim to reproduce the complete orchestral score.

The lead voice is synthesized as low double bass, supported by a tuba pulse. These are newly designed oscillator timbres and do not sample any performance.

## Other initial repertoire

- Edvard Grieg, *Troldtog (March of the Dwarfs)*, Op. 54 No. 3. Mutopia lists a public-domain C. F. Peters source and LilyPond source file: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2014
- Edvard Grieg, *Anitra's Dance*, Op. 46 No. 3. Mutopia lists public-domain late-nineteenth-century sources and downloadable LilyPond files: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=281
- Modest Mussorgsky, *Night on Bald Mountain*. The underlying composition is public domain. Mutopia provides a machine-readable LilyPond piano arrangement under CC BY 3.0: https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1892

Those source files are not packaged. If a future arrangement imports or adapts a licensed modern edition rather than independently encoding the public-domain composition, its exact license and attribution must be recorded here and in the distributed build.

## Register policy

All synthesized level themes keep their lead material in the same low octave band as Level_001's *In the Hall of the Mountain King* arrangement. Revision 346 lowers the alternate lead voices by two octaves while preserving their intervals, rhythm, accompaniment, and melodic contour.
