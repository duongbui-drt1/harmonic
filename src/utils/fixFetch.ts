// Polyfill window.fetch setter/getter to avoid "Cannot set property fetch of #<Window> which has only a getter"
// in sandboxed iframe environments or strict mode browsers where window.fetch is getter-only.

(function initFetchPatch() {
  if (typeof window === "undefined") return;

  // Add global error handler to trap and suppress getter-only window.fetch assignment errors
  window.addEventListener(
    "error",
    (event) => {
      if (
        event.message &&
        (event.message.includes("Cannot set property fetch") ||
          event.message.includes("which has only a getter"))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );

  try {
    const originalFetch = window.fetch ? window.fetch.bind(window) : undefined;
    let currentFetch = originalFetch;

    const descriptor: PropertyDescriptor = {
      get() {
        return currentFetch;
      },
      set(v: any) {
        currentFetch = v;
      },
      configurable: true,
      enumerable: true,
    };

    // Attempt to delete getter-only properties if present
    try {
      delete (Window.prototype as any).fetch;
    } catch {
      // Ignored
    }

    try {
      delete (window as any).fetch;
    } catch {
      // Ignored
    }

    // 1. Override Window.prototype.fetch
    if (typeof Window !== "undefined" && Window.prototype) {
      try {
        Object.defineProperty(Window.prototype, "fetch", descriptor);
      } catch {
        // Ignored
      }
    }

    // 2. Override window instance fetch
    try {
      Object.defineProperty(window, "fetch", descriptor);
    } catch {
      // Ignored
    }

    // 3. Override globalThis fetch if available
    if (typeof globalThis !== "undefined") {
      try {
        Object.defineProperty(globalThis, "fetch", descriptor);
      } catch {
        // Ignored
      }
    }
  } catch {
    // Ignored
  }
})();

export {};
