import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

export default function AdminDbBrowser() {
  const { profile } = useAuth();
  const [table, setTable] = useState('users');
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  const limit = 10;

  const tables = ['users', 'events', 'messages', 'submissions'];
  
  const pks: Record<string, string> = {
    users: 'uid',
    events: 'eventId',
    messages: 'messageId',
    submissions: 'photoId'
  };

  const fetchData = async () => {
    if (profile?.role !== 'admin') return;
    setLoading(true);
    try {
      const response = await api.get(`/admin/db/${table}?page=${page}&limit=${limit}`);
      setData(response.rows || []);
      setTotal(response.total || 0);
    } catch (e) {
      console.error(e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setEditingId(null);
  }, [table, page, profile]);

  if (profile?.role !== 'admin') {
    return <div className="p-10 text-center text-red-500">Access Denied</div>;
  }

  const handleEditClick = (row: any) => {
    const pk = pks[table];
    setEditingId(row[pk]);
    setEditFormData({ ...row });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveClick = async () => {
    try {
      const pk = pks[table];
      const id = editFormData[pk];
      await api.put(`/admin/db/${table}/${id}`, editFormData);
      setEditingId(null);
      fetchData();
    } catch (e) {
      console.error("Failed to update record", e);
      alert("Failed to update record.");
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setEditFormData({
      ...editFormData,
      [key]: value
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Database Browser</h2>
        <div>
          <label htmlFor="table-select" className="mr-2 font-semibold">Entity:</label>
          <select
            id="table-select"
            value={table}
            onChange={(e) => {
              setTable(e.target.value);
              setPage(1); // Reset to page 1 on table change
            }}
            className="border rounded p-2 bg-white"
          >
            {tables.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow mb-4">
        {loading ? (
          <div className="p-10 text-center">Loading...</div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No records found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                {Object.keys(data[0]).map(key => (
                  <th key={key} className="p-4 font-semibold text-sm">{key}</th>
                ))}
                <th className="p-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row, index) => {
                const pk = pks[table];
                const isEditing = editingId === row[pk];

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.keys(row).map((key) => {
                      const val = isEditing ? editFormData[key] : row[key];
                      const isPk = key === pk;
                      
                      return (
                        <td key={key} className="p-4 text-sm max-w-[200px]">
                          {isEditing && !isPk ? (
                            <input 
                              type="text" 
                              className="w-full border rounded px-2 py-1"
                              value={val === null ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                            />
                          ) : (
                            <div className="truncate" title={typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}>
                              {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-sm font-medium">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button onClick={handleSaveClick} className="text-green-600 hover:text-green-800">Save</button>
                          <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-800">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditClick(row)} className="text-indigo-600 hover:text-indigo-800">Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {totalPages === 0 ? 1 : totalPages} ({total} total records)
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
