import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Shield, Mail, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchEmployees } from '@/api/employees.api';

export default function UsersSettings() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    if (!token) return;
    try {
      setError('');
      const res = await fetchEmployees(token);
      setUsers(res.employees || res.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load user accounts.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">User & Role Management</h1>
          <p className="mt-1 text-slate-400">
            Manage authenticated team members and their organizational access permissions.
          </p>
        </div>
        <Link
          to="/employees"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
        >
          <Plus size={17} /> Add Team Member
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
        {loading ? (
          <p className="p-10 text-center text-sm text-slate-400">Loading authorized users...</p>
        ) : users.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">No user records found.</p>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-800/40 text-slate-400">
              <tr>
                <th className="p-4">Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Access Level</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id || u.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="p-4 font-medium text-white">{u.name}</td>
                  <td className="text-slate-300">{u.role || 'Staff'}</td>
                  <td className="text-slate-400">{u.email}</td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  </td>
                  <td>
                    <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                      {u.role === 'Owner' || u.role === 'Admin' ? 'Administrator' : 'Standard User'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
