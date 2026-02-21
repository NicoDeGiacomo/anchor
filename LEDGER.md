TODO:
- Upload to google play

FIX:
- [x] Main screen logo looking far too up — reduced marginBottom from 60 to 20
- [x] Values should be "show all" type — changed method from random to seeAll
- [x] Wallpaper button collapsed (0 height, no text visible) — flex:1 without row parent. Gave it own style without flex:1. Also made all secondary buttons visually lighter (opacity 0.5, dashed border) to distinguish from mode buttons.

FEATURES:
- [x] Wallpapers: Let users choose or write a phrase, generate a simple, calming, no-clutter wallpaper, and save to Photos. New tab with phrase input/picker, template selector (solids + gradients), live preview, and full-res PNG capture via react-native-view-shot + expo-media-library.
- [x] Wallpaper phrase picker modal: Replaced crowded horizontal chip scroll with a two-step modal (pick mode → pick phrase). Added font size control (+/− buttons, range 16–48). Fixed home screen layout: Wallpaper on its own row, Settings + About on a second row.

OTHER:
- Threads, Twitter posts
- Other websites (reddit, producthunt, famous threads/twitter accounts)

