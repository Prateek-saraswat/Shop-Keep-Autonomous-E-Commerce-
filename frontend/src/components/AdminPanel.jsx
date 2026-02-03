import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);

  const exampleCommands = [
    "Stock my store with 3 trending mechanical keyboards under $150",
    "Add the latest iPhone 16 to the store",
    "Find 3 popular gaming mice under $50",
    "Add 2 wireless headphones under $100"
  ];

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/agent/tasks');
      setTasks(response.data.reverse());
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!command.trim()) {
      alert('Please enter a command');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/agent/stock', {
        command: command
      });

      setCurrentTask(response.data);
      setCommand('');
      
      pollTaskStatus(response.data.task_id);
    } catch (err) {
      console.error('Error submitting command:', err);
      alert('Failed to submit command. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const pollTaskStatus = async (taskId) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      
      try {
        const response = await axios.get(`http://localhost:8000/api/agent/status/${taskId}`);
        const task = response.data;

        if (task.status === 'completed' || task.status === 'failed') {
          clearInterval(poll);
          setCurrentTask(task);
          fetchTasks();
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
        }
      } catch (err) {
        console.error('Error polling task:', err);
        clearInterval(poll);
      }
    }, 3000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      queued: { class: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300', text: 'Queued' },
      running: { class: 'bg-blue-500/20 border-blue-400/30 text-blue-300', text: 'Running' },
      completed: { class: 'bg-green-500/20 border-green-400/30 text-green-300', text: 'Completed' },
      failed: { class: 'bg-red-500/20 border-red-400/30 text-red-300', text: 'Failed' }
    };

    return badges[status] || { class: 'bg-gray-500/20 border-gray-400/30 text-gray-300', text: status };
  };

 

  return (
    <div className="max-w-7xl mx-auto px-8 py-16">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-cyan-200 to-blue-400 
              bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-400 text-lg">Command the Agent to stock your store with Products.</p>
          </div>
          
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 mb-8 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Write Command
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Tell the agent what products to add... (e.g., 'Stock my store with 3 trending mechanical keyboards')"
            rows="4"
            disabled={loading}
            className="w-full px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-xl 
              text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 
              focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          
          <button 
            type="submit" 
            disabled={loading || !command.trim()}
            className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 
              hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-lg 
              transition-all duration-300 transform hover:scale-[1.02] hover:shadow-neon-cyan 
              relative overflow-hidden group
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="relative z-10">
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending to Agent...
                </span>
              ) : (
                'Execute Command'
              )}
            </span>
            {!loading && (
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full 
                group-hover:translate-x-full transition-transform duration-700" />
            )}
          </button>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-cyan-300">Example Commands:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {exampleCommands.map((ex, index) => (
              <div 
                key={index} 
                onClick={() => setCommand(ex)}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 
                  border border-cyan-500/20 cursor-pointer transition-all duration-300
                  hover:border-cyan-400/40 hover:bg-cyan-500/20 hover:scale-[1.02] group"
              >
                <p className="text-gray-300 text-sm group-hover:text-white transition-colors">
                  "{ex}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {currentTask && (
        <div className="glass-card rounded-2xl p-8 mb-8 animate-scaleIn">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Current Task
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
          </h2>
          
          <div className="p-6 rounded-xl bg-gray-900/30 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusBadge(currentTask.status).class}`}>
                {getStatusBadge(currentTask.status).text}
              </span>
              <span className="text-gray-400 text-sm">ID: {currentTask.task_id?.substring(0, 8)}</span>
            </div>
            
            <p className="text-white font-medium mb-4">
              "{currentTask.result?.user_command || currentTask.command}"
            </p>
            
            {currentTask.status === 'running' && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-400/20">
                <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <p className="text-blue-300">Agent is working...</p>
              </div>
            )}

            {currentTask.status === 'completed' && currentTask.result && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-400/20">
                  <pre className="text-green-300 text-sm whitespace-pre-wrap font-mono">
                    {currentTask.result.final_message}
                  </pre>
                </div>
                {currentTask.result.found_products && (
                  <div>
                    <h4 className="text-cyan-300 font-semibold mb-3">Products Added:</h4>
                    <ul className="space-y-2">
                      {currentTask.result.found_products.map((p, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {p.name} - ${p.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {currentTask.status === 'failed' && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/20">
                <p className="text-red-300">Error: {currentTask.error || 'Task failed'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl p-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Task History
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
        </h2>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-400">No tasks yet. Issue a command to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 10).map((task, idx) => (
              <div 
                key={task.task_id}
                className="p-4 rounded-xl bg-gray-900/30 border border-white/5 
                  hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-300 group"
                style={{ animation: `slideUp 0.4s ease-out ${idx * 0.1}s backwards` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusBadge(task.status).class}`}>
                    {getStatusBadge(task.status).text}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(task.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-white group-hover:text-cyan-300 transition-colors">
                  "{task.command}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
