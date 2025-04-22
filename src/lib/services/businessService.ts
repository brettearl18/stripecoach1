import { db } from '@/lib/firebase/config'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { storage } from '@/lib/firebase/config'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export interface BusinessDetails {
  businessName: string
  description?: string
  website?: string
  address?: string
  phone?: string
  email: string
  socialLinks: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
  }
}

export interface BrandingSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  logo?: string
  favicon?: string
}

export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  checkInReminders: boolean
  missedCheckInAlerts: boolean
  clientMessages: boolean
  systemUpdates: boolean
  marketingEmails: boolean
}

export class BusinessService {
  private static async getBusinessDoc(coachId: string) {
    return doc(db, 'coaches', coachId, 'settings', 'business')
  }

  static async getBusinessSettings(coachId: string) {
    const docRef = await this.getBusinessDoc(coachId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    return docSnap.data()
  }

  static async updateBusinessDetails(coachId: string, details: BusinessDetails) {
    const docRef = await this.getBusinessDoc(coachId)
    await setDoc(docRef, { details }, { merge: true })
  }

  static async updateBrandingSettings(coachId: string, branding: BrandingSettings) {
    const docRef = await this.getBusinessDoc(coachId)
    await setDoc(docRef, { branding }, { merge: true })
  }

  static async updateNotificationPreferences(coachId: string, preferences: NotificationPreferences) {
    const docRef = await this.getBusinessDoc(coachId)
    await setDoc(docRef, { notifications: preferences }, { merge: true })
  }

  static async uploadImage(coachId: string, file: File, type: 'logo' | 'favicon'): Promise<string> {
    const fileRef = ref(storage, `coaches/${coachId}/business/${type}/${file.name}`)
    await uploadBytes(fileRef, file)
    return getDownloadURL(fileRef)
  }
} 