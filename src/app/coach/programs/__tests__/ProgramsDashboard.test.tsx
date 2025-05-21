import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProgramsDashboard from '../page';
import { programTemplateService } from '@/lib/services/programTemplateService';
import { toast } from 'react-hot-toast';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the programTemplateService
jest.mock('@/lib/services/programTemplateService', () => ({
  programTemplateService: {
    listTemplates: jest.fn()
  }
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

describe('ProgramsDashboard', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders program templates count correctly', async () => {
    const mockTemplates = {
      templates: [
        { id: '1', name: 'Template 1', status: 'active' },
        { id: '2', name: 'Template 2', status: 'active' }
      ]
    };

    (programTemplateService.listTemplates as jest.Mock).mockResolvedValue(mockTemplates);

    render(<ProgramsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Program Templates')).toBeInTheDocument();
    });
  });

  it('handles empty template list correctly', async () => {
    (programTemplateService.listTemplates as jest.Mock).mockResolvedValue({ templates: [] });

    render(<ProgramsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Program Templates')).toBeInTheDocument();
    });
  });

  it('handles navigation errors gracefully', async () => {
    const mockTemplates = {
      templates: [
        { id: '1', name: 'Template 1', status: 'active' }
      ]
    };

    (programTemplateService.listTemplates as jest.Mock).mockResolvedValue(mockTemplates);
    mockRouter.push.mockRejectedValue(new Error('Navigation failed'));

    render(<ProgramsDashboard />);

    await waitFor(() => {
      const createButton = screen.getByText('Create New Template');
      fireEvent.click(createButton);
      expect(toast.error).toHaveBeenCalledWith('Navigation failed');
    });
  });

  it('handles API errors gracefully', async () => {
    (programTemplateService.listTemplates as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ProgramsDashboard />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load templates');
    });
  });
});