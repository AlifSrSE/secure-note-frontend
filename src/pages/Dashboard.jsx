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
    await createNote({ title, content });
    setTitle('');
    setContent('');
    fetchNotes(1);
  };

  const handleUpdate = async (id) => {
    await updateNote(id, { title: editTitle, content: editContent });
    setEditingId(null);
    fetchNotes(page);
  };

  const handleDelete = async (id) => {
    await deleteNote(id);
    fetchNotes(page);
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  return (
    <div>
      <nav>
        <div>Secure Notes</div>
        <div>
          <span>Hello, {user?.name} ({user?.role})</span>
          {user?.role === 'admin' && <a href="/admin">Admin</a>}
          <button onClick={logout}>Logout</button>
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
            <button type="submit">Add Note</button>
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
                  <button onClick={() => handleUpdate(note._id)}>Save</button>
                  <button className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <h4>{note.title}</h4>
                  <p>{note.content}</p>
                  <button onClick={() => startEdit(note)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(note._id)}>Delete</button>
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
    </div>
  );
}
