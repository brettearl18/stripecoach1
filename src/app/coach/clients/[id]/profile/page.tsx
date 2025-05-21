"use client";

import React, { useEffect, useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { clientService } from "@/lib/services/clientService";
import { ClientProfile } from "@/types/client";
import { TemplateAssignment } from "@/types/checkIn";

export default function ClientProfile() {
  const { id } = useParams();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [assignments, setAssignments] = useState<TemplateAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch client profile
        const clientData = await clientService.getClientProfile(id);
        setClient(clientData);

        // Fetch assigned templates for this client
        const res = await fetch(`/api/template-assignments?clientId=${id}`);
        if (res.ok) {
          const data = await res.json();
          // Filter assignments for this client (API may return all for coach)
          setAssignments(data.assignments.filter((a: TemplateAssignment) => a.clientId === id));
        } else {
          setAssignments([]);
        }
      } catch (err: any) {
        setError("Failed to load client data");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

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
                <li key={assignment.id} className="text-gray-300">
                  <span className="font-semibold">{assignment.templateId}</span> &ndash; {assignment.frequency} (Next Due: {assignment.nextDueDate ? new Date(assignment.nextDueDate).toLocaleDateString() : 'N/A'})
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
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
      </div>
    </div>
  );
} 