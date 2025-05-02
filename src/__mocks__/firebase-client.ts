export const auth = {
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
  currentUser: null,
};

export const db = {
  collection: jest.fn(() => ({
    doc: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    get: jest.fn(),
    add: jest.fn(),
  })),
  doc: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};

export const storage = {
  ref: jest.fn(() => ({
    put: jest.fn(),
    getDownloadURL: jest.fn(),
    delete: jest.fn(),
  })),
}; 