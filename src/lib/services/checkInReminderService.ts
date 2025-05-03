import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { emailService } from './emailService';

interface CheckInReminder {
  clientId: string;
  clientEmail: string;
  clientName: string;
  coachName: string;
  dueDate: Date;
}

export const checkInReminderService = {
  async getPendingCheckIns(): Promise<CheckInReminder[]> {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Query clients with check-ins due tomorrow
      const clientsRef = collection(db, 'clients');
      const q = query(
        clientsRef,
        where('nextCheckIn', '>=', Timestamp.fromDate(now)),
        where('nextCheckIn', '<=', Timestamp.fromDate(tomorrow))
      );

      const snapshot = await getDocs(q);
      const reminders: CheckInReminder[] = [];

      for (const doc of snapshot.docs) {
        const clientData = doc.data();
        const coachRef = await clientData.coachRef.get();
        const coachData = coachRef.data();

        reminders.push({
          clientId: doc.id,
          clientEmail: clientData.email,
          clientName: clientData.name,
          coachName: coachData.name,
          dueDate: clientData.nextCheckIn.toDate()
        });
      }

      return reminders;
    } catch (error) {
      console.error('Error getting pending check-ins:', error);
      throw error;
    }
  },

  async sendReminders(): Promise<void> {
    try {
      const reminders = await this.getPendingCheckIns();

      for (const reminder of reminders) {
        await emailService.sendEmail({
          to: reminder.clientEmail,
          subject: 'Check-in Reminder',
          template: 'checkInReminder',
          data: {
            clientName: reminder.clientName,
            coachName: reminder.coachName,
            dueDate: reminder.dueDate.toLocaleDateString()
          }
        });
      }
    } catch (error) {
      console.error('Error sending check-in reminders:', error);
      throw error;
    }
  }
}; 