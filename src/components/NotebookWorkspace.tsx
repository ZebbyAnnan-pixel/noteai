import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Brain,
  ArrowLeft,
  Plus,
  FileText,
  Link,
  Type,
  Send,
  Loader2,
  Trash2,
  MoreVertical,
  MessageCircle,
  FolderOpen,
  BookOpen,
  Quote,
  X,
  LogOut,
  Upload,
  Image,
  File,
  Download,
  CheckCircle,
} from 'lucide-react';
import { supabase, Notebook, Document, ChatMessage } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

interface NotebookWorkspaceProps {
  notebook: Notebook;
  onBack: () => void;
  onSignOut: () => void;
}

type TabType = 'chat' | 'sources' | 'overview';
type SourceType = 'text' | 'link' | 'file' | 'image';

export default function NotebookWorkspace({ notebook, onBack, onSignOut }: NotebookWorkspaceProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('sources');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [newSourceType, setNewSourceType] = useState<SourceType>('text');
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceContent, setNewSourceContent] = useState('');
  const [addingSource, setAddingSource] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchMessages();
  }, [notebook.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('notebook_id', notebook.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('notebook_id', notebook.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleFileUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !user) return;

    const sourceType = file.type.startsWith('image/') ? 'image' : 'file';
    const sourceName = newSourceName.trim() || file.name;
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${user.id}/${notebook.id}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    setAddingSource(true);
    setUploadProgress('Uploading file...');

    try {
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress('Getting file URL...');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) throw new Error('Failed to get file URL');

      setUploadProgress('Saving to database...');

      // Extract content from file (basic approach - for text files)
      let content: string | null = null;
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        content = await file.text();
      }

      // Save document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          notebook_id: notebook.id,
          user_id: user.id,
          name: sourceName,
          type: sourceType,
          content: content,
          file_url: urlData.publicUrl,
          status: 'ready',
        })
        .select()
        .single();

      if (docError) throw docError;

      setDocuments([docData, ...documents]);
      setShowAddSourceModal(false);
      resetSourceForm();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setAddingSource(false);
      setUploadProgress(null);
    }
  }

  async function addSource() {
    if (newSourceType === 'file' || newSourceType === 'image') {
      await handleFileUpload();
      return;
    }

    if (!newSourceName.trim() || !newSourceContent.trim()) return;

    setAddingSource(true);
    setUploadProgress('Adding source...');

    try {
      let finalContent = newSourceContent.trim();
      const finalFileUrl = newSourceType === 'link' ? newSourceContent.trim() : null;

      // For links, we'll fetch content via the Edge Function
      // The content placeholder will be replaced by the Edge Function when answering questions
      if (newSourceType === 'link') {
        setUploadProgress('Fetching web content...');
        // Note: The actual content fetching will happen on-demand when chatting
        // This keeps the notebook responsive
      }

      setUploadProgress('Saving to database...');

      const { data, error } = await supabase
        .from('documents')
        .insert({
          notebook_id: notebook.id,
          user_id: user!.id,
          name: newSourceName.trim(),
          type: newSourceType as 'text' | 'link',
          content: newSourceType === 'text' ? finalContent : null,
          file_url: finalFileUrl,
          status: 'ready',
        })
        .select()
        .single();

      if (error) throw error;
      setDocuments([data, ...documents]);
      setShowAddSourceModal(false);
      resetSourceForm();
    } catch (error) {
      console.error('Error adding source:', error);
    } finally {
      setAddingSource(false);
      setUploadProgress(null);
    }
  }

  async function deleteDocument(doc: Document) {
    try {
      // If document has a file URL, delete from storage first
      if (doc.file_url) {
        const url = new URL(doc.file_url);
        const pathParts = url.pathname.split('/document/');
        if (pathParts[1]) {
          await supabase.storage.from('documents').remove([pathParts[1]]);
        }
      }

      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;
      setDocuments(documents.filter((d) => d.id !== doc.id));
      setMenuOpenId(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }

  async function sendMessage() {
    if (!chatInput.trim() || sendingMessage) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setSendingMessage(true);

    try {
      // Save user message
      const { data: savedUserMsg, error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          notebook_id: notebook.id,
          user_id: user!.id,
          role: 'user',
          content: userMessage,
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;
      setMessages([...messages, savedUserMsg]);

      // Call Edge Function for AI response
      const aiResponse = await getAIResponse(userMessage, documents);

      // Save AI message
      const { data: savedAiMsg, error: aiMsgError } = await supabase
        .from('chat_messages')
        .insert({
          notebook_id: notebook.id,
          user_id: user!.id,
          role: 'assistant',
          content: aiResponse.content,
          citations: aiResponse.citations,
        })
        .select()
        .single();

      if (aiMsgError) throw aiMsgError;
      setMessages((prev) => [...prev, savedAiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  }

  async function getAIResponse(
    userMessage: string,
    docs: Document[]
  ): Promise<{ content: string; citations: Array<{ source: string; text: string }> }> {
    // If no documents, return early
    if (docs.length === 0) {
      return {
        content: "I don't have any sources to reference yet. Please add some documents, links, or notes to your notebook so I can help you explore them!",
        citations: [],
      };
    }

    try {
      // Call the Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          question: userMessage,
          sources: docs.map(doc => ({
            name: doc.name,
            type: doc.type,
            content: doc.content,
            file_url: doc.file_url,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      return {
        content: data.answer,
        citations: data.citations || [],
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to basic response
      return {
        content: `I found ${docs.length} source(s) but couldn't process your question properly. Please try again or add more relevant sources.`,
        citations: [],
      };
    }
  }

  function resetSourceForm() {
    setNewSourceName('');
    setNewSourceContent('');
    setNewSourceType('text');
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <Link className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'file':
        return <File className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const sourceTypeButtons = [
    { type: 'text' as const, label: 'Text / Notes', icon: Type },
    { type: 'link' as const, label: 'Link', icon: Link },
    { type: 'file' as const, label: 'Document', icon: FileText },
    { type: 'image' as const, label: 'Image', icon: Image },
  ];

  const tabs = [
    { id: 'sources' as const, label: 'Sources', icon: FolderOpen },
    { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
    { id: 'overview' as const, label: 'Overview', icon: BookOpen },
  ];

  const sourceCount = documents.length;
  const readySources = documents.filter((d) => d.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900">{notebook.name}</h1>
                  <p className="text-xs text-slate-500">
                    {sourceCount} source{sourceCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
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

          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'sources' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Sources</h2>
                <p className="text-sm text-slate-600">
                  Upload documents to build your knowledge base
                </p>
              </div>
              <button
                onClick={() => {
                  resetSourceForm();
                  setShowAddSourceModal(true);
                }}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Source</span>
              </button>
            </div>

            {loadingDocs ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No sources yet</h3>
                <p className="text-slate-600 mb-6">
                  Add your first source to start building your knowledge base
                </p>
                <button
                  onClick={() => setShowAddSourceModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Source
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          {getDocumentIcon(doc.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{doc.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {doc.type.toUpperCase()} • {doc.status}
                          </p>
                          {doc.file_url && (doc.type === 'image' || doc.type === 'file') && (
                            <div className="mt-2">
                              {doc.type === 'image' ? (
                                <img
                                  src={doc.file_url}
                                  alt={doc.name}
                                  className="max-h-32 rounded-lg border border-slate-200"
                                />
                              ) : (
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                >
                                  <Download className="w-3 h-3" />
                                  Download file
                                </a>
                              )}
                            </div>
                          )}
                          {doc.content && !doc.file_url && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                              {doc.content.substring(0, 150)}...
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === doc.id ? null : doc.id)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {menuOpenId === doc.id && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                            <button
                              onClick={() => deleteDocument(doc)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-220px)] flex flex-col">
            <div className="flex-1 overflow-y-auto pb-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16">
                  <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Start a conversation</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Ask questions about your sources and I'll find relevant information from your
                    documents.
                  </p>
                  {documents.length === 0 && (
                    <p className="text-amber-600 text-sm mt-4">
                      Add sources first to get the most out of chat!
                    </p>
                  )}
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                            <Quote className="w-3 h-3" />
                            <span>Citations</span>
                          </div>
                          <div className="space-y-1">
                            {msg.citations.map((citation, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-slate-50 rounded px-2 py-1 text-slate-600"
                              >
                                <span className="font-medium">{citation.source}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about your sources..."
                className="flex-1 px-4 py-2 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                disabled={sendingMessage}
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim() || sendingMessage}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {sendingMessage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-3xl font-bold text-slate-900">{sourceCount}</div>
                <div className="text-sm text-slate-600">Total Sources</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-3xl font-bold text-emerald-600">{readySources}</div>
                <div className="text-sm text-slate-600">Ready</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-3xl font-bold text-blue-600">{messages.length}</div>
                <div className="text-sm text-slate-600">Messages</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-4">About This Notebook</h3>
              {notebook.description ? (
                <p className="text-slate-600">{notebook.description}</p>
              ) : (
                <p className="text-slate-400 italic">No description provided</p>
              )}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Created {new Date(notebook.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Source Modal */}
      {showAddSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Add Source</h2>
              <button
                onClick={() => {
                  setShowAddSourceModal(false);
                  resetSourceForm();
                }}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Source Type Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {sourceTypeButtons.map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => {
                    setNewSourceType(btn.type);
                    setNewSourceContent('');
                  }}
                  className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                    newSourceType === btn.type
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <btn.icon className="w-4 h-4" />
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Source Name
                </label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder={
                    newSourceType === 'link'
                      ? 'e.g., Research Article'
                      : newSourceType === 'image'
                      ? 'e.g., Notes Photo'
                      : newSourceType === 'file'
                      ? 'e.g., Important Document'
                      : 'e.g., My Notes'
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Text/Notes Input */}
              {newSourceType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={newSourceContent}
                    onChange={(e) => setNewSourceContent(e.target.value)}
                    placeholder="Paste or type your notes here..."
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}

              {/* Link Input */}
              {newSourceType === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newSourceContent}
                    onChange={(e) => setNewSourceContent(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* File Upload */}
              {(newSourceType === 'file' || newSourceType === 'image') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload {newSourceType === 'image' ? 'Image' : 'Document'}
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={
                        newSourceType === 'image'
                          ? 'image/*'
                          : '.pdf,.txt,.md,.doc,.docx,.xls,.xlsx,.ppt,.pptx'
                      }
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && !newSourceName) {
                          setNewSourceName(file.name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                    />
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Click to upload
                    </button>
                    <p className="text-xs text-slate-500 mt-1">
                      {newSourceType === 'image'
                        ? 'PNG, JPG, GIF up to 10MB'
                        : 'PDF, TXT, MD, DOC files'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 text-slate-600">
                      {fileInputRef.current?.files?.[0]?.name && (
                        <span className="inline-flex items-center gap-1 text-">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          {fileInputRef.current.files[0].name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddSourceModal(false);
                    resetSourceForm();
                  }}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addSource}
                  disabled={
                    addingSource ||
                    (newSourceType === 'text' && (!newSourceName.trim() || !newSourceContent.trim())) ||
                    (newSourceType === 'link' && (!newSourceName.trim() || !newSourceContent.trim())) ||
                    ((newSourceType === 'file' || newSourceType === 'image') && !fileInputRef.current?.files?.[0])
                  }
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addingSource ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>Add Source</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu backdrop */}
      {menuOpenId && <div className="fixed inset-0 z-0" onClick={() => setMenuOpenId(null)} />}
    </div>
  );
}
