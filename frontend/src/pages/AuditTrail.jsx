// src/pages/AuditTrail.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const { token } = useAuth();

  const fetchAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/audit-logs?page=${page}&limit=${pagination.limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      
      setAuditLogs(data.rows || data.logs || []);
      setPagination({
        page: data.pagination?.page || page,
        limit: data.pagination?.limit || pagination.limit,
        totalPages: data.pagination?.totalPages || 1
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [token]);

  const handlePageChange = (newPage) => {
    fetchAuditLogs(newPage);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="spinner">Loading audit trail...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Audit Trail</h1>
      
      {auditLogs.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p>No audit logs found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Timestamp</th>
                <th className="p-3 text-left">IP Address</th>
                <th className="p-3 text-left">Additional Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{log.action}</td>
                  <td className="p-3">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">{log.ipAddress || 'N/A'}</td>
                  <td className="p-3">
                    {log.metadata ? (
                      <details>
                        <summary>View Details</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      'No additional details'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center p-4">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;