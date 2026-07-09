// Experimental renderer feature flags.
//
// House rule for the static bake experiment:
// normal Canvas2D/WebGL renderer features must not be made more complex solely
// to keep this alternate renderer mode compatible. Stop and ask the project
// owner before adding abstractions, special cases, or invalidation plumbing for
// the baked/chunked path.
export const ENABLE_EXPERIMENTAL_STATIC_BAKE_RENDERER = true;
