# INTRO #

This is about a 2D platformer where a catoony wizard as protagonist for a 2D platformer game. 
The game is written in HTML+JS.  
He will usually be running from left to right but we can easily mirror all assets.
He will be animated from a part of assets.

## VIEWPORT SCALING RULE ##

The game uses a shared virtual viewport. On narrow mobile screens the renderer scales the whole canvas down instead of scaling individual sprites or physics values. Keep gameplay, collision, camera, particle, and level coordinates in virtual game coordinates. Convert mouse, touch, and pointer screen coordinates through the viewport transform before passing them into gameplay controls.

## ANIMATION PIPELINE RULE ##

Ground running is data-driven through `assets/ct_anim_wizard_run_1.json` and `IgnatiusRocketfrock_ANIMATION.js`. Do not add new run-pose formulas to the renderer or scale animation values per sprite. Animation `x`/`y` values are unscaled rig-space pixels, `rotation` is radians, `scale` multiplies the rig part target height, and `alpha` is scalar opacity. The procedural run and its comparison mode were removed in revision 056. Edit run keyframes in `character_tool.html`; shared keyframe mutations belong in `IgnatiusRocketfrock_ANIMATION_EDITOR.js`.

## CHARACTER TOOL DATA-LAYER RULE ##

Do not merge atlas-frame rectangles with rig-part semantics. The atlas manifest identifies reusable pixel rectangles in a PNG. The rig assigns those frames to parts and owns pivots, anchors, draw order, roles, and gameplay/editor tags. Character project selection, blank-template creation, URL loading, and local PNG/JSON workspaces are centralized through `character_tool.html` and `IgnatiusRocketfrock_CHARACTER_PROJECT.js`; do not reintroduce wizard-only hardcoded paths. Atlas rectangle authoring and independent per-document dirty tracking were added in revision 061. The next editor work should add rig-part creation/deletion, atlas-frame assignment, draw-order controls, and role/tag editing before expanding the animation library.

## CHARACTER TOOL DIRECT-EDIT RULE ##

Puppet Forge direct transform editing uses the same rig-space animation coordinates as exported JSON. The canvas view zoom is presentation-only. Convert pointer positions through `IgnatiusRocketfrock_CHARACTER_VIEW.js`; never bake preview zoom, canvas pixels, mirroring, or CSS scale into X/Y/rotation keyframe values. Direct drags must create missing keys at the current playhead before mutation so sampled in-between poses do not masquerade as persistent edits.
