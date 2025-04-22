import { useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentArrowUpIcon, DocumentTextIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { templateService } from '../services/templateService';
import { toast } from 'sonner';

interface TemplateImportProps {
  onImport: (template: any) => void;
}

export default function TemplateImport({ onImport }: TemplateImportProps) {
  const [importType, setImportType] = useState<'file' | 'json' | 'clipboard'>('file');
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const template = JSON.parse(e.target?.result as string);
        if (!templateService.validateTemplate(template)) {
          throw new Error('Invalid template structure');
        }
        await templateService.importTemplate(template);
        onImport(template);
        toast.success('Template imported successfully');
      } catch (err) {
        setError('Invalid template file format');
        toast.error('Failed to import template');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleJsonImport = async () => {
    setLoading(true);
    setError('');

    try {
      const template = JSON.parse(jsonInput);
      if (!templateService.validateTemplate(template)) {
        throw new Error('Invalid template structure');
      }
      await templateService.importTemplate(template);
      onImport(template);
      setJsonInput('');
      toast.success('Template imported successfully');
    } catch (err) {
      setError('Invalid JSON format');
      toast.error('Failed to import template');
    } finally {
      setLoading(false);
    }
  };

  const handleClipboardImport = async () => {
    setLoading(true);
    setError('');

    try {
      const text = await navigator.clipboard.readText();
      const template = JSON.parse(text);
      if (!templateService.validateTemplate(template)) {
        throw new Error('Invalid template structure');
      }
      await templateService.importTemplate(template);
      onImport(template);
      toast.success('Template imported successfully');
    } catch (err) {
      setError('Invalid template in clipboard');
      toast.error('Failed to import template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Import Template</h2>
        <p className="text-gray-400">
          Import an existing template from various sources
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* File Upload */}
        <div className="bg-[#1C1C1F] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DocumentArrowUpIcon className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Upload Template File</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Upload a JSON template file exported from another system
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-600 file:text-white
              hover:file:bg-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* JSON Input */}
        <div className="bg-[#1C1C1F] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DocumentTextIcon className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Paste JSON Template</h3>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            disabled={loading}
            className="w-full h-32 bg-[#2C2C30] text-white rounded-lg p-4 text-sm font-mono
              disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Paste your template JSON here..."
          />
          <button
            onClick={handleJsonImport}
            disabled={loading || !jsonInput.trim()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Importing...' : 'Import JSON'}
          </button>
        </div>

        {/* Clipboard Import */}
        <div className="bg-[#1C1C1F] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardDocumentIcon className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Import from Clipboard</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Import a template that you've copied to your clipboard
          </p>
          <button
            onClick={handleClipboardImport}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Importing...' : 'Import from Clipboard'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
          {error}
        </div>
      )}
    </motion.div>
  );
} 