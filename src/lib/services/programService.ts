import { QueryOptimizer } from './queryOptimizer';
import { Program } from '@/types/program';

const programOptimizer = new QueryOptimizer('programs');

export const programService = {
  async getPrograms(coachId: string, options: { type?: string; searchTerm?: string } = {}): Promise<Program[]> {
    const filters = [
      { field: 'coachId', operator: '==', value: coachId }
    ];

    if (options.type) {
      filters.push({ field: 'type', operator: '==', value: options.type });
    }

    if (options.searchTerm) {
      filters.push({ 
        field: 'name', 
        operator: '>=', 
        value: options.searchTerm.toLowerCase()
      });
      filters.push({ 
        field: 'name', 
        operator: '<=', 
        value: options.searchTerm.toLowerCase() + '\uf8ff'
      });
    }

    try {
      const { data } = await programOptimizer.executeQuery({
        filters,
        pagination: {
          pageSize: 50,
          orderByField: 'createdAt',
          orderDirection: 'desc'
        }
      });
      
      return data as Program[];
    } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
  },

  async getProgramById(programId: string): Promise<Program | null> {
    try {
      const { data } = await programOptimizer.executeQuery({
        filters: [{ field: 'id', operator: '==', value: programId }],
        pagination: { pageSize: 1 }
      });
      
      return data[0] as Program || null;
    } catch (error) {
      console.error('Error fetching program:', error);
      throw error;
    }
  },

  clearCache() {
    programOptimizer.clearCache();
  }
}; 