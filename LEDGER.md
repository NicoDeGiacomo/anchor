TODO:
- ~~NTH: Frontend tests~~ Done. 85 tests across 6 suites (phraseStorage, useModes, usePhrases, ThemeContext, LanguageContext, Themed). jest-expo + @testing-library/react-native. Coverage: utils 89%, contexts 91%, hooks 80-87%, Themed 100%.
- Readme with updated screenshots
- ~~Fix problems found with app store~~ Accepted! v1.0.0 live on App Store.
- ~~Check phrases inside grounding~~ Added 25 new phrases from Grupo ACT resources (breathing, body awareness, defusion, mindfulness, gratitude). All 3 languages.
- ~~Copy from resources from Rochi~~ Done. Extracted 36 images, categorized into grounding (25 phrases) and new Values mode (8 phrases). See docs/GRUPO_ACT_PHRASES.md.
- Review Spanish translations of new grounding/values phrases (machine-translated EN/PT from ES originals)
- New "Values" mode added (hidden by default) — 8 reflective ACT-based questions, random method. Existing users need to enable it in settings.
- ~~React Doctor fixes (37 warnings)~~ Done. Deleted 3 unused files (ExternalLink, StyledText, Logo), removed unused exports from Themed.tsx, removed autoFocus from 3 TextInputs, replaced dangerouslySetInnerHTML in +html.tsx, consolidated context setState (LanguageContext/ThemeContext), moved error throw to render body in _layout.tsx, fixed inline functions in PhraseItem, replaced useState with useReducer in settings.tsx and edit-phrases/[mode].tsx. All 85 tests pass.

FIX:
- App Icon: Add padding. Remove top-down dark gradient.
- App name looks bad on the main screen of the phone

FEATURES:
- Wallpapers: Let users choose or write a phrase, generate a simple, calming, no-clutter wallpaper, and set it as home screen, lock screen, or both.

OTHER:
- Threads, Twitter posts
- Other websites (reddit, producthunt, famous threads/twitter accounts)

