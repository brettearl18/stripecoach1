import { db, storage } from '@/lib/firebase/firebase-client';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'link';
  url: string;
  filePath?: string;
  category: string;
  tags: string[];
  metadata: {
    size?: number;
    mimeType?: string;
    duration?: number;
    thumbnailUrl?: string;
  };
  access: {
    public: boolean;
    allowedRoles: string[];
    allowedOrganizations: string[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const resourceService = {
  // Create a new resource
  async createResource(
    resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>,
    file?: File
  ): Promise<Resource> {
    try {
      const resourceRef = doc(collection(db, 'resources'));
      let filePath: string | undefined;
      let url = resource.url;

      if (file) {
        filePath = `resources/${resourceRef.id}/${file.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        url = await getDownloadURL(storageRef);
      }

      const newResource: Resource = {
        ...resource,
        id: resourceRef.id,
        filePath,
        url,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(resourceRef, newResource);
      return newResource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  // Get a resource by ID
  async getResource(id: string): Promise<Resource | null> {
    try {
      const resourceRef = doc(db, 'resources', id);
      const resourceSnap = await getDoc(resourceRef);
      
      if (!resourceSnap.exists()) {
        return null;
      }

      return resourceSnap.data() as Resource;
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }
  },

  // List resources with filtering and pagination
  async listResources(params: {
    category?: string;
    type?: string;
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ resources: Resource[]; total: number }> {
    try {
      let q = collection(db, 'resources');
      const constraints = [];

      if (params.category) {
        constraints.push(where('category', '==', params.category));
      }

      if (params.type) {
        constraints.push(where('type', '==', params.type));
      }

      if (params.tags?.length) {
        constraints.push(where('tags', 'array-contains-any', params.tags));
      }

      if (params.search) {
        constraints.push(where('title', '>=', params.search));
        constraints.push(where('title', '<=', params.search + '\uf8ff'));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;

      const querySnapshot = await getDocs(query(q, ...constraints));
      const total = querySnapshot.size;
      const resources = querySnapshot.docs
        .slice(offset, offset + limit)
        .map(doc => ({ id: doc.id, ...doc.data() } as Resource));

      return { resources, total };
    } catch (error) {
      console.error('Error listing resources:', error);
      throw error;
    }
  },

  // Update a resource
  async updateResource(
    id: string,
    updates: Partial<Resource>,
    file?: File
  ): Promise<Resource> {
    try {
      const resourceRef = doc(db, 'resources', id);
      const resourceSnap = await getDoc(resourceRef);

      if (!resourceSnap.exists()) {
        throw new Error('Resource not found');
      }

      const currentResource = resourceSnap.data() as Resource;
      let filePath = currentResource.filePath;
      let url = currentResource.url;

      if (file) {
        // Delete old file if it exists
        if (currentResource.filePath) {
          const oldStorageRef = ref(storage, currentResource.filePath);
          await deleteObject(oldStorageRef);
        }

        // Upload new file
        filePath = `resources/${id}/${file.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        url = await getDownloadURL(storageRef);
      }

      const updatedResource = {
        ...currentResource,
        ...updates,
        filePath,
        url,
        updatedAt: new Date()
      };

      await updateDoc(resourceRef, updatedResource);
      return updatedResource;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  // Delete a resource
  async deleteResource(id: string): Promise<void> {
    try {
      const resourceRef = doc(db, 'resources', id);
      const resourceSnap = await getDoc(resourceRef);

      if (!resourceSnap.exists()) {
        throw new Error('Resource not found');
      }

      const resource = resourceSnap.data() as Resource;

      // Delete file from storage if it exists
      if (resource.filePath) {
        const storageRef = ref(storage, resource.filePath);
        await deleteObject(storageRef);
      }

      await deleteDoc(resourceRef);
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }
}; 