import '@testing-library/jest-dom/vitest'

// Some DOM-like runtimes omit SharedArrayBuffer/Atomics; stub them so libraries that
// feature-detect SAB do not crash during unit tests.
if (typeof globalThis.SharedArrayBuffer === 'undefined') {
  ;(globalThis as unknown as { SharedArrayBuffer: typeof ArrayBuffer }).SharedArrayBuffer = ArrayBuffer
}

if (typeof globalThis.Atomics === 'undefined') {
  ;(globalThis as unknown as { Atomics: Record<string, (...args: unknown[]) => unknown> }).Atomics = {
    add: () => 0,
    and: () => 0,
    compareExchange: () => 0,
    exchange: () => 0,
    load: () => 0,
    notify: () => 0,
    or: () => 0,
    store: () => 0,
    sub: () => 0,
    wait: () => 'timed-out',
    xor: () => 0,
  }
}
