import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Vitest doesn't register `afterEach` as a global unless `test.globals` is
// set, which @testing-library/react's auto-cleanup relies on — without this,
// every render() leaks into the next test's DOM.
afterEach(() => {
  cleanup()
})

// jsdom doesn't implement matchMedia — several hooks (useMediaQuery,
// useReducedMotion) and Radix internals call it unconditionally.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// jsdom doesn't implement ResizeObserver — Radix Select/Popover measure
// their trigger/content with it.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom doesn't implement PointerEvent capture or scrollIntoView — Radix
// Select relies on both when opening/scrolling its popper content.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
