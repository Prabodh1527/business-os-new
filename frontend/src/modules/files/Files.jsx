import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Download,
  Trash2,
  Folder,
  Plus,
  File,
} from 'lucide-react';

const STORAGE_KEY = 'business_os_files';

const defaultFiles = [
  {
    id: 1,
    name: 'Business_Registration_Certificate.pdf',
    category: 'Business Documents',
    type: 'PDF',
    size: '345 KB',
    date: new Date().toLocaleDateString('en-GB'),
  },
  {
    id: 2,
    name: 'Standard_Invoice_Template.pdf',
    category: 'Invoices',
    type: 'PDF',
    size: '120 KB',
    date: new Date().toLocaleDateString('en-GB'),
  },
  {
    id: 3,
    name: 'Employee_Policy_Handbook.pdf',
    category: 'HR Documents',
    type: 'PDF',
    size: '520 KB',
    date: new Date().toLocaleDateString('en-GB'),
  },
];

const categories = ['All', 'Invoices', 'Payslips', 'Business Documents', 'HR Documents', 'Reports'];

export default function Files() {
  const [files, setFiles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultFiles;
    } catch {
      return defaultFiles;
    }
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (e) {
      console.warn('Storage limit reached');
    }
  }, [files]);

  const handleFileUpload = (e) => {
    const uploaded = Array.from(e.target.files || []);
    if (!uploaded.length) return;

    const newEntries = uploaded.map((f, idx) => ({
      id: Date.now() + idx,
      name: f.name,
      category: activeCategory === 'All' ? 'Business Documents' : activeCategory,
      type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
      size: `${Math.round(f.size / 1024)} KB`,
      date: new Date().toLocaleDateString('en-GB'),
    }));

    setFiles((prev) => [...newEntries, ...prev]);
    e.target.value = '';
  };

  const deleteFile = (id) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredFiles = files.filter((f) => {
    const matchesCat = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Document & File Storage</h1>
          <p className="mt-1 text-slate-400">
            Upload, archive, and manage receipts, invoices, and business documentation.
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            <Upload size={17} /> Upload Document
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-sm transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No files found in this category.
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <FileText size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-white">{file.name}</h3>
                  <p className="text-xs text-slate-500">
                    {file.category} • {file.size} • {file.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteFile(file.id)}
                className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                title="Delete file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}