// Public A11Y API (names chosen to match current callers)

export { applyA11y } from './applyA11y';

// Profiles / presets
export { A11Y_PRESETS, type A11yProfile } from './a11yProfiles';

// Screen reader announcer (export both names for compatibility)
export { SrAnnounce } from './sr-announce';
export { SrAnnounce as srAnnounce } from './sr-announce';

// Input modality (export alias for compatibility)
export { inputModality } from './input-modality';
export { inputModality as getInputModality } from './input-modality';

// Validator (export with alias)
export { a11yValidator } from './a11y-validator';
export { a11yValidator as validateA11y } from './a11y-validator';

// TODO: Add focus primitives
// export { FocusTrap } from './focus/FocusTrap'
// export { FocusScope } from './focus/FocusScope'
// export { FocusZone } from './focus/FocusZone'
