import React, { useEffect, useMemo, useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';

const OfficerDashboard: React.FC = () => {
  const { complaints, loading, assignToResolvingOfficer } = useComplaints();
  const { user, isDepartmentHead } = useAuth();
  const [resolvingOfficers, setResolvingOfficers] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);

  // Load resolving officers for this department (for assigning officer)
  useEffect(() => {
    const loadOfficers = async () => {
      if (!user || !isDepartmentHead || !user.department) return;
      try {
        setLoadingOfficers(true);
        const res = await fetch(`/api/departments/by-name/${encodeURIComponent(user.department)}/resolving-officers`);
        if (res.ok) {
          const data = await res.json();
          setResolvingOfficers(data);
        } else {
          setResolvingOfficers([]);
        }
      } finally {
        setLoadingOfficers(false);
      }
    };
    loadOfficers();
  }, [user, isDepartmentHead]);

  const pendingComplaints = useMemo(() => complaints.filter(complaint => 
    complaint.status === 'NEW' || complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS'
  ), [complaints]);

  const unassignedComplaints = useMemo(() => complaints.filter(c => c.status === 'NEW' && !c.assignedTo), [complaints]);

  const handleAssign = async (complaintId: string, resolvingOfficerId: string) => {
    await assignToResolvingOfficer(complaintId, resolvingOfficerId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Officer Dashboard</h1>
        <div className="text-center">
          <p>Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{isDepartmentHead ? 'Assigning Officer' : 'Officer'} Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Complaints</h2>
          <p className="text-3xl font-bold">{complaints.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Pending Complaints</h2>
          <p className="text-3xl font-bold">{pendingComplaints.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Resolved Complaints</h2>
          <p className="text-3xl font-bold">
            {complaints.filter(c => c.status === 'RESOLVED').length}
          </p>
        </div>
      </div>

      {isDepartmentHead && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Unassigned Complaints</h2>
          {loadingOfficers ? (
            <p className="text-sm text-gray-500">Loading officers...</p>
          ) : unassignedComplaints.length === 0 ? (
            <p className="text-sm text-gray-500">No unassigned complaints.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unassignedComplaints.map(complaint => (
                    <tr key={complaint.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          className="border rounded px-2 py-1"
                          onChange={(e) => handleAssign(complaint.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Select officer</option>
                          {resolvingOfficers.map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-900" onClick={() => {}}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Complaints</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingComplaints.slice(0, 5).map((complaint) => (
                <tr key={complaint.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {complaint.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {complaint.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${complaint.status === 'NEW' ? 'bg-yellow-100 text-yellow-800' : 
                        complaint.status === 'ASSIGNED' ? 'bg-orange-100 text-orange-800' :
                        complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard; 