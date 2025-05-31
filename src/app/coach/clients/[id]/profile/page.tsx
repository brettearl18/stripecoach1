"use client";

import React, { useEffect, useState } from "react";
import { UserIcon, PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { clientService } from "@/lib/services/clientService";
import { ClientProfile } from "@/types/client";
import { TemplateAssignment } from "@/types/checkIn";

interface Template {
  id: string;
  name?: string;
  title?: string;
}

interface CheckIn {
  id: string;
  completedAt?: string;
  metrics?: Record<string, any>;
  notes?: string;
}

export default function ClientProfile() {
  const { id } = useParams();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [assignments, setAssignments] = useState<TemplateAssignment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [removingAssignmentId, setRemovingAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch client profile
        const clientData = await clientService.getClientProfile(id);
        if (!clientData) {
          setError("Client not found");
          return;
        }
        setClient(clientData);

        // Fetch assigned templates for this client
        const res = await fetch(`/api/template-assignments?clientId=${id}`);
        let assignmentsData: TemplateAssignment[] = [];
        if (res.ok) {
          const data = await res.json();
          assignmentsData = data.assignments.filter((a: TemplateAssignment) => a.clientId === id);
          setAssignments(assignmentsData);
        } else {
          setAssignments([]);
        }

        // Fetch all templates for the coach (to map templateId to name)
        if (clientData.coachId) {
          const templatesRes = await fetch(`/api/coach/${clientData.coachId}/templates`);
          if (templatesRes.ok) {
            const templatesList = await templatesRes.json();
            setTemplates(templatesList);
          } else {
            setTemplates([]);
          }
        }

        // Fetch last 5 check-ins for this client
        const checkInsRes = await fetch(`/api/check-ins?clientId=${id}&limit=5`);
        if (checkInsRes.ok) {
          const checkInsList = await checkInsRes.json();
          setCheckIns(checkInsList);
        } else {
          setCheckIns([]);
        }
      } catch (err: any) {
        setError("Failed to load client data");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // Helper to get template name by id
  const getTemplateName = (templateId: string) => {
    const found = templates.find(t => t.id === templateId);
    return found?.name || found?.title || templateId;
  };

  // Helper to get template options for dropdown
  const templateOptions = templates.map(t => ({ value: t.id, label: t.name || t.title || t.id }));

  // Helper to update assignment
  const handleSaveEdit = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/template-assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });
      if (res.ok) {
        // Refresh assignments
        const data = await res.json();
        setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, ...editValues } : a));
        setEditingAssignmentId(null);
        setEditValues({});
      } else {
        alert("Failed to update assignment");
      }
    } catch (err) {
      alert("Error updating assignment");
    }
  };

  // Helper to remove assignment
  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/template-assignments/${assignmentId}`, { method: "DELETE" });
      if (res.ok) {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
        setRemovingAssignmentId(null);
      } else {
        alert("Failed to remove assignment");
      }
    } catch (err) {
      alert("Error removing assignment");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }
  if (error || !client) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">{error || "Client not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center py-16">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
            <UserIcon className="h-10 w-10 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{client.firstName} {client.lastName}</h1>
            <p className="text-gray-400">{client.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>{client.status}</span>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Coach Notes</h2>
          <p className="text-gray-300">{client.notes || "No notes yet."}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Assigned Templates</h2>
          {assignments.length === 0 ? (
            <p className="text-gray-400">No templates assigned.</p>
          ) : (
            <ul className="space-y-1">
              {assignments.map((assignment) => (
                <li key={assignment.id} className="text-gray-300 flex items-center gap-2">
                  {editingAssignmentId === assignment.id ? (
                    <>
                      <select
                        className="bg-gray-700 text-white rounded px-2 py-1"
                        value={editValues.templateId || assignment.templateId}
                        onChange={e => setEditValues(v => ({ ...v, templateId: e.target.value }))}
                      >
                        {templateOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <select
                        className="bg-gray-700 text-white rounded px-2 py-1"
                        value={editValues.frequency || assignment.frequency}
                        onChange={e => setEditValues(v => ({ ...v, frequency: e.target.value }))}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                      </select>
                      <input
                        type="date"
                        className="bg-gray-700 text-white rounded px-2 py-1"
                        value={editValues.nextDueDate ? editValues.nextDueDate.split('T')[0] : (assignment.nextDueDate ? new Date(assignment.nextDueDate).toISOString().split('T')[0] : '')}
                        onChange={e => setEditValues(v => ({ ...v, nextDueDate: e.target.value }))}
                      />
                      <button className="text-green-400 hover:text-green-600" onClick={() => handleSaveEdit(assignment.id)} title="Save"><CheckIcon className="h-5 w-5" /></button>
                      <button className="text-gray-400 hover:text-gray-600" onClick={() => { setEditingAssignmentId(null); setEditValues({}); }} title="Cancel"><XMarkIcon className="h-5 w-5" /></button>
                    </>
                  ) : removingAssignmentId === assignment.id ? (
                    <>
                      <span>Are you sure?</span>
                      <button className="text-red-400 hover:text-red-600 ml-2" onClick={() => handleRemoveAssignment(assignment.id)} title="Confirm Remove"><CheckIcon className="h-5 w-5" /></button>
                      <button className="text-gray-400 hover:text-gray-600 ml-1" onClick={() => setRemovingAssignmentId(null)} title="Cancel"><XMarkIcon className="h-5 w-5" /></button>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">{getTemplateName(assignment.templateId)}</span> &ndash; {assignment.frequency} (Next Due: {assignment.nextDueDate ? new Date(assignment.nextDueDate).toLocaleDateString() : 'N/A'})
                      <button className="text-blue-400 hover:text-blue-600 ml-2" onClick={() => { setEditingAssignmentId(assignment.id); setEditValues({ templateId: assignment.templateId, frequency: assignment.frequency, nextDueDate: assignment.nextDueDate ? new Date(assignment.nextDueDate).toISOString().split('T')[0] : '' }); }} title="Edit"><PencilSquareIcon className="h-5 w-5" /></button>
                      <button className="text-red-400 hover:text-red-600 ml-1" onClick={() => setRemovingAssignmentId(assignment.id)} title="Remove"><TrashIcon className="h-5 w-5" /></button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Check-in Stats</h2>
          {client.metrics ? (
            <ul className="space-y-1 text-gray-300">
              <li>Check-ins: {client.metrics.checkIns}</li>
              <li>Consistency: {client.metrics.consistency}%</li>
              <li>Streak: {client.metrics.daysStreak} days</li>
              <li>Completion Rate: {client.metrics.completionRate}%</li>
              <li>Last Check-in: {client.metrics.lastCheckIn ? new Date(client.metrics.lastCheckIn).toLocaleDateString() : 'Never'}</li>
            </ul>
          ) : (
            <p className="text-gray-400">No check-in stats available.</p>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Recent Check-ins</h2>
          {checkIns.length === 0 ? (
            <p className="text-gray-400">No check-ins found.</p>
          ) : (
            <ul className="space-y-3">
              {checkIns.map((checkIn) => (
                <li key={checkIn.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      {checkIn.completedAt ? new Date(checkIn.completedAt).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                  {checkIn.metrics && (
                    <div className="mb-2 grid grid-cols-2 gap-2">
                      {Object.entries(checkIn.metrics).map(([key, value]) => (
                        <div key={key} className="text-xs text-gray-300">
                          <span className="capitalize">{key}:</span> <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {checkIn.notes && (
                    <div className="text-xs text-gray-400 mt-1">Notes: {checkIn.notes}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 