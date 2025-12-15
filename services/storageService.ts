
const DB_NAME = 'EntReportProDB';
const STORE_NAME = 'settings';

// Inicializa o banco de dados
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
};

export const saveDirectoryHandle = async (handle: FileSystemDirectoryHandle): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(handle, 'directoryHandle');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getDirectoryHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get('directoryHandle');

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null); // Fail gracefully
  });
};

export const saveFileToHandle = async (dirHandle: FileSystemDirectoryHandle, blob: Blob, filename: string): Promise<void> => {
  // @ts-ignore
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  // @ts-ignore
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
};

export const verifyPermission = async (handle: FileSystemDirectoryHandle, readWrite: boolean = false): Promise<boolean> => {
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  try {
    // @ts-ignore
    if ((await handle.queryPermission(options)) === 'granted') {
      return true;
    }
    // @ts-ignore
    if ((await handle.requestPermission(options)) === 'granted') {
      return true;
    }
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
  }
  return false;
};
