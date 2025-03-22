import { db } from '@/lib/firebase-admin';
import { defaultCheckInTemplate } from '@/lib/data/form-templates';

async function seedFormTemplates() {
  try {
    // Check if the default check-in template already exists
    const existingTemplate = await db
      .collection('formTemplates')
      .where('name', '==', defaultCheckInTemplate.name)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (!existingTemplate.empty) {
      console.log('Default check-in template already exists');
      return;
    }

    // Add the default check-in template
    await db.collection('formTemplates').add(defaultCheckInTemplate);
    console.log('Successfully seeded default check-in template');
  } catch (error) {
    console.error('Error seeding form templates:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedFormTemplates(); 