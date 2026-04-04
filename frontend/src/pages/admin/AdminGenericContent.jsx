import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Save, ArrowLeft, Code } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

const AdminGenericContent = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch raw content or specific game settings
    setLoading(false);
  }, [gameId]);

  const handleSave = () => {
    toast.success('Feature coming soon: Generic JSON schema editor for new games!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/games')} className="p-2 hover:bg-slate-100 rounded-xl"><ArrowLeft /></button>
        <h2 className="text-2xl font-bold">Advanced Content Editor</h2>
      </div>

      <div className="glass-card !p-8 space-y-6">
        <div className="flex items-center gap-3 text-amber-500">
          <Code size={24} />
          <h3 className="font-bold">Raw Data Management</h3>
        </div>
        
        <p className="text-slate-500">
          For future games that don't have a specialized UI yet, you can manage their raw data here.
        </p>

        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 font-mono text-sm p-6 bg-slate-950 text-emerald-400 rounded-2xl border-2 border-slate-800"
          placeholder='{ "levels": [...], "config": {...} }'
        />

        <div className="flex justify-end">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save size={20} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminGenericContent;
