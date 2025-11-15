import { openDB } from 'idb';

const DB_NAME = 'share-story-db';
const DB_VERSION = 1;
const STORE_NAME = 'savedStories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('by-id', 'id');
    }
  }
});

export async function saveStory(story) {
  return (await dbPromise).put(STORE_NAME, story);
}

export async function getAllSavedStories() {
  return (await dbPromise).getAll(STORE_NAME);
}

export async function getSavedStoryById(id) {
  return (await dbPromise).get(STORE_NAME, id);
}

export async function deleteSavedStory(id) {
  return (await dbPromise).delete(STORE_NAME, id);
}
