import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listNotes, createNote, deleteNote, updateNote } from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNotes = async (p = 1) => {
    const res = await listNotes(p);
    setNotes(res.data.notes);
    setPage(res.data.page);
    setPages(res.data.pages);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    await createNote({ title, content });
    setTitle('');
    setContent('');
    setCreating(false);
    fetchNotes(1);
  };

  const handleUpdate = async (id) => {
    setUpdating(true);
    await updateNote(id, { title: editTitle, content: editContent });
    setEditingId(null);
    setUpdating(false);
    fetchNotes(page);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    await deleteNote(id);
    setDeleteTarget(null);
    setDeleting(false);
    fetchNotes(page);
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#1f2937', color: '#fff' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold' }}>Secure Notes</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>Hello, {user?.name} ({user?.role})</span>
          {user?.role === 'admin' && (
            <a href="/admin" style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', borderRadius: 4, background: '#374151', fontSize: 14 }}>Admin</a>
          )}
          <button onClick={logout} style={{ padding: '6px 12px', background: '#dc2626', fontSize: 14 }}>Logout</button>
        </div>
      </nav>
      <div className="container">
        <div className="card">
          <h3>Create Note</h3>
          <form onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              rows="4"
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <button type="submit" disabled={creating}>{creating ? 'Adding...' : 'Add Note'}</button>
          </form>
        </div>

        <div className="card">
          <h3>My Notes</h3>
          {notes.length === 0 && <p>No notes yet.</p>}
          {notes.map((note) => (
            <div key={note._id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
              {editingId === note._id ? (
                <div>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    rows="3"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <button disabled={updating}>{updating ? 'Editing...' : 'Save'}</button>
                  <button className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <h4>{note.title}</h4>
                  <p>{note.content}</p>
                  <button onClick={() => startEdit(note)}>Edit</button>
                  <button className="danger" onClick={() => setDeleteTarget(note)}>Delete</button>
                </div>
              )}
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <button disabled={page <= 1} onClick={() => { setPage(page - 1); fetchNotes(page - 1); }}>Prev</button>
            <span style={{ margin: '0 10px' }}>Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => { setPage(page + 1); fetchNotes(page + 1); }}>Next</button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: 400, textAlign: 'center' }}>
            <h3>Are you sure you want to delete this note?</h3>
            <p><strong>{deleteTarget.title}</strong></p>
            <div style={{ marginTop: 16 }}>
              <button className="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="danger" onClick={() => handleDelete(deleteTarget._id)} disabled={deleting} style={{ marginLeft: 8 }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
