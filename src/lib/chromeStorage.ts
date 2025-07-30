export function getFromStorage<T = any>(key: string, area: 'local' | 'sync' = 'local'): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage[area].get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function setToStorage<T = any>(key: string, value: T, area: 'local' | 'sync' = 'local'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage[area].set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function getMultipleFromStorage<T = any>(keys: string[], area: 'local' | 'sync' = 'local'): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage[area].get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result as T);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function setMultipleToStorage<T = any>(items: T, area: 'local' | 'sync' = 'local'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage[area].set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function addStorageListener(callback: (changes: any, area: string) => void): () => void {
  chrome.storage.onChanged.addListener(callback);
  return () => chrome.storage.onChanged.removeListener(callback);
}
