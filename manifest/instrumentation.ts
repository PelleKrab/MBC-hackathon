// Polyfill localStorage for Node.js server-side
// Node.js 21+ has experimental localStorage that doesn't work properly
// This polyfill creates a functional in-memory storage for server-side

export async function register() {
  if (typeof window === "undefined") {
    // We're on the server
    const globalAny = global as unknown as { localStorage?: Storage };
    
    // Create a simple in-memory storage that won't throw errors
    const memoryStorage: Storage = {
      length: 0,
      clear: () => {},
      getItem: () => null,
      key: () => null,
      removeItem: () => {},
      setItem: () => {},
    };
    
    // Override the broken localStorage
    globalAny.localStorage = memoryStorage;
  }
}

