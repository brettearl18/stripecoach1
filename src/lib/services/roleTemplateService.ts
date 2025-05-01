import { db } from '@/lib/firebase/config';
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
  serverTimestamp 
} from 'firebase/firestore';
import { RoleTemplate, RoleHierarchy, Role } from '@/types/role';

const ROLE_TEMPLATES_COLLECTION = 'roleTemplates';
const ROLE_HIERARCHY_COLLECTION = 'roleHierarchy';
const ROLES_COLLECTION = 'roles';

export const roleTemplateService = {
  // Role Template Management
  async createRoleTemplate(template: Omit<RoleTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleTemplate> {
    const templateRef = doc(collection(db, ROLE_TEMPLATES_COLLECTION));
    const newTemplate: RoleTemplate = {
      ...template,
      id: templateRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(templateRef, newTemplate);
    return newTemplate;
  },

  async getRoleTemplate(templateId: string): Promise<RoleTemplate | null> {
    const templateRef = doc(db, ROLE_TEMPLATES_COLLECTION, templateId);
    const templateDoc = await getDoc(templateRef);
    
    if (!templateDoc.exists()) {
      return null;
    }

    return templateDoc.data() as RoleTemplate;
  },

  async updateRoleTemplate(templateId: string, updates: Partial<RoleTemplate>): Promise<boolean> {
    try {
      const templateRef = doc(db, ROLE_TEMPLATES_COLLECTION, templateId);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating role template:', error);
      return false;
    }
  },

  async deleteRoleTemplate(templateId: string): Promise<boolean> {
    try {
      const templateRef = doc(db, ROLE_TEMPLATES_COLLECTION, templateId);
      await deleteDoc(templateRef);
      return true;
    } catch (error) {
      console.error('Error deleting role template:', error);
      return false;
    }
  },

  async listRoleTemplates(): Promise<RoleTemplate[]> {
    const templatesRef = collection(db, ROLE_TEMPLATES_COLLECTION);
    const templatesSnapshot = await getDocs(templatesRef);
    
    return templatesSnapshot.docs.map(doc => doc.data() as RoleTemplate);
  },

  // Role Hierarchy Management
  async createRoleHierarchy(hierarchy: Omit<RoleHierarchy, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoleHierarchy> {
    const hierarchyRef = doc(collection(db, ROLE_HIERARCHY_COLLECTION));
    const newHierarchy: RoleHierarchy = {
      ...hierarchy,
      id: hierarchyRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(hierarchyRef, newHierarchy);
    return newHierarchy;
  },

  async getRoleHierarchy(hierarchyId: string): Promise<RoleHierarchy | null> {
    const hierarchyRef = doc(db, ROLE_HIERARCHY_COLLECTION, hierarchyId);
    const hierarchyDoc = await getDoc(hierarchyRef);
    
    if (!hierarchyDoc.exists()) {
      return null;
    }

    return hierarchyDoc.data() as RoleHierarchy;
  },

  async updateRoleHierarchy(hierarchyId: string, updates: Partial<RoleHierarchy>): Promise<boolean> {
    try {
      const hierarchyRef = doc(db, ROLE_HIERARCHY_COLLECTION, hierarchyId);
      await updateDoc(hierarchyRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating role hierarchy:', error);
      return false;
    }
  },

  async deleteRoleHierarchy(hierarchyId: string): Promise<boolean> {
    try {
      const hierarchyRef = doc(db, ROLE_HIERARCHY_COLLECTION, hierarchyId);
      await deleteDoc(hierarchyRef);
      return true;
    } catch (error) {
      console.error('Error deleting role hierarchy:', error);
      return false;
    }
  },

  async listRoleHierarchies(): Promise<RoleHierarchy[]> {
    const hierarchiesRef = collection(db, ROLE_HIERARCHY_COLLECTION);
    const hierarchiesSnapshot = await getDocs(hierarchiesRef);
    
    return hierarchiesSnapshot.docs.map(doc => doc.data() as RoleHierarchy);
  },

  // Role Management with Templates and Hierarchy
  async createRoleFromTemplate(
    templateId: string, 
    customizations: Partial<Role>
  ): Promise<Role | null> {
    try {
      const template = await this.getRoleTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const roleRef = doc(collection(db, ROLES_COLLECTION));
      const newRole: Role = {
        ...template,
        ...customizations,
        id: roleRef.id,
        templateId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(roleRef, newRole);
      return newRole;
    } catch (error) {
      console.error('Error creating role from template:', error);
      return null;
    }
  },

  async updateRoleWithHierarchy(
    roleId: string, 
    hierarchyId: string
  ): Promise<boolean> {
    try {
      const role = await this.getRole(roleId);
      const hierarchy = await this.getRoleHierarchy(hierarchyId);
      
      if (!role || !hierarchy) {
        throw new Error('Role or hierarchy not found');
      }

      // Inherit permissions from parent role if exists
      let inheritedPermissions: string[] = [];
      if (hierarchy.parentRole) {
        const parentRole = await this.getRole(hierarchy.parentRole);
        if (parentRole) {
          inheritedPermissions = Object.entries(parentRole.permissions)
            .filter(([_, value]) => value)
            .map(([key]) => key);
        }
      }

      const roleRef = doc(db, ROLES_COLLECTION, roleId);
      await updateDoc(roleRef, {
        hierarchyId,
        inheritedPermissions,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error updating role with hierarchy:', error);
      return false;
    }
  },

  async getRole(roleId: string): Promise<Role | null> {
    const roleRef = doc(db, ROLES_COLLECTION, roleId);
    const roleDoc = await getDoc(roleRef);
    
    if (!roleDoc.exists()) {
      return null;
    }

    return roleDoc.data() as Role;
  },

  async listRoles(): Promise<Role[]> {
    const rolesRef = collection(db, ROLES_COLLECTION);
    const rolesSnapshot = await getDocs(rolesRef);
    
    return rolesSnapshot.docs.map(doc => doc.data() as Role);
  }
}; 