import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listUsers, getUser, createUser, updateUser, deleteUser, getUsersByInterest, getUserPosts } from '../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interests, setInterests] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', interests: [] });
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'user', interests: '' });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    setLoading(true);
    loadUsers();
    loadInterests();
  }, [user, navigate]);

  const loadUsers = async (p = 1) => {
    try {
      setError('');
      const res = await listUsers(p);
      setUsers(res.data.users);
      setPage(res.data.page);
      setPages(res.data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadInterests = async () => {
    try {
      const res = await getUsersByInterest();
      setInterests(res.data);
    } catch (err) {
      console.error('Failed to load interests:', err);
    }
  };

  const loadUserPosts = async (userId) => {
    const res = await getUserPosts(userId);
    setPosts(res.data);
    setSelectedUserId(userId);
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      interests: u.interests || [],
    });
  };

  const handleUpdate = async (id) => {
    await updateUser(id, editForm);
    setEditingId(null);
    loadUsers(page);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      await createUser({
        ...addForm,
        interests: addForm.interests.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setAddForm({ name: '', email: '', password: '', role: 'user', interests: '' });
      setShowAddForm(false);
      loadUsers(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    loadUsers(page);
  };

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#1f2937', color: '#fff' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold' }}>Admin Panel</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/dashboard" style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', borderRadius: 4, background: '#374151', fontSize: 14 }}>Notes</a>
          <button onClick={logout} style={{ padding: '6px 12px', background: '#dc2626', fontSize: 14 }}>Logout</button>
        </div>
      </nav>
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>All Users</h3>
            <button onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? 'Cancel' : 'Add User'}</button>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading && <p>Loading users...</p>}
          {!loading && users.length === 0 && !error && <p>No users found.</p>}
          {showAddForm && (
            <form onSubmit={handleAddUser} style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 6 }}>
              <input
                type="text"
                placeholder="Full Name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                required
              />
              <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <input
                type="text"
                placeholder="Interests (comma separated)"
                value={addForm.interests}
                onChange={(e) => setAddForm({ ...addForm, interests: e.target.value })}
              />
              <button type="submit" disabled={addingUser}>{addingUser ? 'Adding...' : 'Create User'}</button>
            </form>
          )}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Interests</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    {editingId === u._id ? (
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    ) : (
                      u.name
                    )}
                  </td>
                  <td>
                    {editingId === u._id ? (
                      <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td>
                    {editingId === u._id ? (
                      <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>
                  <td>
                    {editingId === u._id ? (
                      <input
                        value={editForm.interests.join(', ')}
                        onChange={(e) => setEditForm({ ...editForm, interests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                      />
                    ) : (
                      (u.interests || []).map((i) => <span key={i} className="tag">{i}</span>)
                    )}
                  </td>
                  <td>
                    {editingId === u._id ? (
                      <>
                        <button onClick={() => handleUpdate(u._id)}>Save</button>
                        <button className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)}>Edit</button>
                        <button className="danger" onClick={() => handleDelete(u._id)}>Delete</button>
                        <button onClick={() => loadUserPosts(u._id)}>Posts</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <button disabled={page <= 1} onClick={() => { setPage(page - 1); loadUsers(page - 1); }}>Prev</button>
            <span style={{ margin: '0 10px' }}>Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => { setPage(page + 1); loadUsers(page + 1); }}>Next</button>
          </div>
        </div>

        <div className="card">
          <h3>Users Grouped by Interests</h3>
          {interests.map((item) => (
            <div key={item._id}>
              <strong>{item._id}</strong> ({item.count} users)
              <ul>
                {item.users.map((u) => (
                  <li key={u._id}>{u.name} ({u.email})</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {selectedUserId && (
          <div className="card">
            <h3>Posts for User {selectedUserId}</h3>
            {posts.map((p) => (
              <div key={p._id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <h4>{p.title}</h4>
                <p>{p.content}</p>
                <small>By {p.authorName} ({p.authorEmail})</small>
              </div>
            ))}
            <button className="secondary" onClick={() => setSelectedUserId('')}>Hide Posts</button>
          </div>
        )}
      </div>
    </div>
  );
}
