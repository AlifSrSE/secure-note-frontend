import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listUsers, getUser, updateUser, deleteUser, getUsersByInterest, getUserPosts } from '../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [interests, setInterests] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', interests: [] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadUsers();
    loadInterests();
  }, [user, navigate]);

  const loadUsers = async (p = 1) => {
    const res = await listUsers(p);
    setUsers(res.data.users);
    setPage(res.data.page);
    setPages(res.data.pages);
  };

  const loadInterests = async () => {
    const res = await getUsersByInterest();
    setInterests(res.data);
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

  const handleDelete = async (id) => {
    await deleteUser(id);
    loadUsers(page);
  };

  return (
    <div>
      <nav>
        <div>Admin Panel</div>
        <div>
          <a href="/dashboard">Notes</a>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      <div className="container">
        <div className="card">
          <h3>All Users</h3>
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
