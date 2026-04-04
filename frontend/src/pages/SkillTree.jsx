import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Terminal, 
  Puzzle, 
  Calculator, 
  ChevronRight,
  Zap,
  Star,
  BrainCircuit,
  Layout
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SkillTree = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [treeData, setTreeData] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      const res = await api.get('/gamification/skill-tree');
      setTreeData(res.data.tree);
      setProgress(res.data.progress);
    } catch (error) {
      console.error('Failed to fetch skill tree', error);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (nodeId, parentId) => {
    if (!parent) return true;
    return progress.includes(parentId);
  };

  const getStatus = (nodeId, parentId) => {
    if (progress.includes(nodeId)) return 'completed';
    if (!parentId || progress.includes(parentId)) return 'active';
    return 'locked';
  };

  const renderBranch = (branchName, nodes) => {
    const icons = { learning: Terminal, puzzle: Puzzle, math: Calculator };
    
    return (
      <div className="space-y-12">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-400 border-l-4 border-primary-500 pl-4">
          {branchName}
        </h3>
        <div className="flex flex-col items-center gap-16 relative">
          {nodes.map((node, index) => {
            const status = getStatus(node.id, node.parent);
            const Icon = icons[node.type] || Layout;
            
            return (
              <React.Fragment key={node.id}>
                {/* Visual Connection */}
                {index > 0 && (
                  <div className={`absolute w-1 h-16 -z-10 ${status === 'locked' ? 'bg-slate-800' : 'bg-primary-500/30'}`} 
                       style={{ top: `${index * 128 - 64}px` }} />
                )}
                
                <motion.div
                  whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
                  onClick={() => status !== 'locked' && setSelectedNode(node)}
                  className={`
                    relative w-24 h-24 rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-500
                    ${status === 'completed' ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] text-white' : 
                      status === 'active' ? 'bg-primary-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] text-white' : 
                      'bg-slate-900 border-2 border-slate-800 text-slate-600'}
                  `}
                >
                  <Icon size={32} />
                  {status === 'completed' && (
                    <div className="absolute -top-2 -right-2 bg-emerald-400 rounded-full p-1 border-4 border-slate-950">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  {status === 'locked' && (
                    <div className="absolute -top-2 -right-2 bg-slate-800 rounded-full p-1 border-4 border-slate-950">
                      <Lock size={16} />
                    </div>
                  )}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black uppercase tracking-widest text-slate-500">
                    {node.label}
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Skill Tree...</div>;

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-24">
          <h1 className="text-6xl font-black tracking-tighter text-gradient mb-4">
            MASTERY TREE
          </h1>
          <p className="text-slate-500 uppercase tracking-[0.3em] font-bold text-sm">
            Unlock your potential • level {user?.level}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          {Object.entries(treeData).map(([name, nodes]) => renderBranch(name, nodes))}
        </div>
      </div>

      {/* Node Details Modal */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] max-w-lg w-full text-center relative"
            >
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                ✕
              </button>
              
              <div className="w-20 h-20 bg-primary-500 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
                <Star size={40} />
              </div>
              
              <h2 className="text-3xl font-black mb-2">{selectedNode.label}</h2>
              <p className="text-slate-400 mb-10">
                This skill is part of your {selectedNode.type} progression. 
                Complete the associated challenges to advance.
              </p>
              
              <button
                onClick={() => navigate(selectedNode.path || '/games')}
                className="btn-primary w-full py-5 text-xl font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                Start Mission <ChevronRight size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillTree;
