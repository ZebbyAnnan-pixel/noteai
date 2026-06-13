import { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  FolderOpen,
  Search,
  MoreVertical,
  Trash2,
  Edit3,
  LogOut,
  Loader2,
  X,
} from 'lucide-react';
import { supabase, Notebook } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

interface DashboardProps {
  onOpenNotebook: (notebook: Notebook) => void;
  onSignOut: () => void;
}

const notebookColors = [
  { name: 'blue', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'amber', gradient: 'from-amber-500 to-orange-500' },
  { name: 'rose', gradient: 'from-rose-500 to-pink-500' },
  { name: 'indigo', gradient: 'from-indigo-500 to-violet-500' },
  { name: 'slate', gradient: 'from-slate-600 to-slate-500' },
];

export default function Dashboard({ onOpenNotebook, onSignOut }: DashboardProps) {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookDescription, setNewNotebookDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [creating, setCreating] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  async function fetchNotebooks() {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotebooks(data || []);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createNotebook() {
    if (!newNotebookName.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          name: newNotebookName.trim(),
          description: newNotebookDescription.trim() || null,
          color: selectedColor,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      setNotebooks([data, ...notebooks]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating notebook:', error);
    } finally {
      setCreating(false);
    }
  }

  async function updateNotebook() {
    if (!editingNotebook || !newNotebookName.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .update({
          name: newNotebookName.trim(),
          description: newNotebookDescription.trim() || null,
          color: selectedColor,
        })
        .eq('id', editingNotebook.id)
        .select()
        .single();

      if (error) throw error;
      setNotebooks(notebooks.map((n) => (n.id === data.id ? data : n)));
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating notebook:', error);
    } finally {
      setCreating(false);
    }
  }

  async function deleteNotebook(id: string) {
    try {
      const { error } = await supabase.from('notebooks').delete().eq('id', id);
      if (error) throw error;
      setNotebooks(notebooks.filter((n) => n.id !== id));
      setMenuOpenId(null);
    } catch (error) {
      console.error('Error deleting notebook:', error);
    }
  }

  function resetForm() {
    setNewNotebookName('');
    setNewNotebookDescription('');
    setSelectedColor('blue');
    setEditingNotebook(null);
  }

  function openEditModal(notebook: Notebook) {
    setEditingNotebook(notebook);
    setNewNotebookName(notebook.name);
    setNewNotebookDescription(notebook.description || '');
    setSelectedColor(notebook.color);
    setShowCreateModal(true);
    setMenuOpenId(null);
  }

  const filteredNotebooks = notebooks.filter(
    (n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorGradient = (colorName: string) => {
    const color = notebookColors.find((c) => c.name === colorName);
    return color?.gradient || 'from-blue-500 to-cyan-500';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">NotebookLM</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-slate-600">{user?.email}</span>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Notebooks</h1>
          <p className="text-slate-600">Create and manage your AI-powered research notebooks</p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search notebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>New Notebook</span>
          </button>
        </div>

        {/* Notebooks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredNotebooks.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? 'No notebooks found' : 'No notebooks yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first notebook to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Notebook
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotebooks.map((notebook) => (
              <div
                key={notebook.id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all"
              >
                <div
                  className={`h-2 bg-gradient-to-r ${getColorGradient(notebook.color)}`}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                      {notebook.name}
                    </h3>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === notebook.id ? null : notebook.id);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {menuOpenId === notebook.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(notebook);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotebook(notebook.id);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {notebook.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {notebook.description}
                    </p>
                  )}

                  <button
                    onClick={() => onOpenNotebook(notebook)}
                    className="w-full mt-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                  >
                    Open Notebook
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingNotebook ? 'Edit Notebook' : 'Create New Notebook'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  placeholder="e.g., Research Notes"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newNotebookDescription}
                  onChange={(e) => setNewNotebookDescription(e.target.value)}
                  placeholder="What's this notebook about?"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {notebookColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full bg-gradient-to-r ${color.gradient} ${
                        selectedColor === color.name
                          ? 'ring-2 ring-offset-2 ring-slate-900'
                          : ''
                      } transition-all hover:scale-110`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingNotebook ? updateNotebook : createNotebook}
                  disabled={!newNotebookName.trim() || creating}
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>{editingNotebook ? 'Save Changes' : 'Create'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {menuOpenId && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpenId(null)} />
      )}
    </div>
  );
}
