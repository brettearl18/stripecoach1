'use client';

import { useState } from 'react';
import {
  CalendarIcon,
  PlusIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TabContentProps {
  client: any;
}

interface CheckInResponse {
  question: string;
  answer: string;
  type: 'text' | 'number' | 'scale' | 'choice';
}

interface CheckInDetails {
  id: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  metrics: Record<string, any>;
  responses: CheckInResponse[];
}

interface CheckInDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: CheckInDetails | null;
}

function CheckInDetailsModal({ isOpen, onClose, checkIn }: CheckInDetailsModalProps) {
  if (!checkIn) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border border-gray-700">
        <DialogHeader>
          <DialogTitle>Check-in Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium">
                {new Date(checkIn.date).toLocaleDateString()} at {checkIn.time}
              </span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              checkIn.status === 'completed'
                ? 'bg-green-900/20 text-green-400 border border-green-800/20'
                : 'bg-yellow-900/20 text-yellow-400 border border-yellow-800/20'
            }`}>
              {checkIn.status}
            </span>
          </div>

          {/* Metrics */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(checkIn.metrics).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="text-gray-400 capitalize">{key}: </span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Responses */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Responses</h3>
            {checkIn.responses?.map((response, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-300 mb-2">{response.question}</p>
                <p className="text-sm text-white">{response.answer}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          {checkIn.notes && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Additional Notes</h3>
              <p className="text-sm text-gray-300">{checkIn.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CheckInsTab({ client }: TabContentProps) {
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckInDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-6">
      {/* Check-ins List */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Check-in History</h2>
            <button
              onClick={() => {/* TODO: Implement new check-in */}}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Check-in
            </button>
          </div>

          <div className="space-y-4">
            {client.checkIns?.map((checkIn: CheckInDetails) => (
              <div
                key={checkIn.id}
                className="bg-gray-700/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setSelectedCheckIn(checkIn);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-white">
                        {new Date(checkIn.date).toLocaleDateString()} at {checkIn.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">{checkIn.notes}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    checkIn.status === 'completed'
                      ? 'bg-green-900/20 text-green-400 border border-green-800/20'
                      : 'bg-yellow-900/20 text-yellow-400 border border-yellow-800/20'
                  }`}>
                    {checkIn.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-4">
                  {Object.entries(checkIn.metrics).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-400 capitalize">{key}: </span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCheckIn(checkIn);
                      setShowDetails(true);
                    }}
                    className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    View Details
                    <ChevronRightIcon className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check-in Details Modal */}
      <CheckInDetailsModal
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedCheckIn(null);
        }}
        checkIn={selectedCheckIn}
      />
    </div>
  );
} 