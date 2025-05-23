
import React, { useState } from 'react';
import { BowlingSession } from '../hooks/useBowlingGame';

interface SessionManagerProps {
  sessions: BowlingSession[];
  activeSessionId: number;
  setActiveSessionId: (id: number) => void;
  addSession: () => void;
  renameSession: (id: number, title: string) => void;
  toggleVisibility: (id: number) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  sessions,
  activeSessionId,
  setActiveSessionId,
  addSession,
  renameSession,
  toggleVisibility
}) => {
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editSessionTitle, setEditSessionTitle] = useState('');
  
  const handleEditStart = (session: BowlingSession) => {
    setEditingSessionId(session.id);
    setEditSessionTitle(session.title);
  };
  
  const handleEditSave = (id: number) => {
    if (editSessionTitle.trim()) {
      renameSession(id, editSessionTitle.trim());
    }
    setEditingSessionId(null);
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Sessions</h2>
        <button
          onClick={addSession}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          New Session
        </button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {sessions.map(session => (
          <div 
            key={session.id}
            className={`
              relative 
              p-4 
              rounded-lg 
              shadow-md 
              transition-all 
              duration-200 
              cursor-pointer
              ${session.id === activeSessionId 
                ? 'bg-white text-blue-800 border-2 border-blue-400' 
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'}
            `}
            onClick={() => setActiveSessionId(session.id)}
          >
            {editingSessionId === session.id ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editSessionTitle}
                  onChange={(e) => setEditSessionTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(session.id);
                    if (e.key === 'Escape') setEditingSessionId(null);
                  }}
                  className="bg-white text-gray-800 px-2 py-1 rounded w-full mr-2"
                  autoFocus
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSave(session.id);
                  }}
                  className="bg-green-500 text-white p-1 rounded"
                >
                  ✓
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSessionId(null);
                  }}
                  className="bg-red-500 text-white p-1 rounded ml-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <div className="font-bold mb-1">{session.title}</div>
                <div className="text-sm opacity-80">
                  {session.games.filter(g => g.isVisible).length} game{session.games.filter(g => g.isVisible).length !== 1 && 's'}
                </div>
                {session.savedToDatabase && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-xs text-white px-2 py-1 rounded-full">
                    Saved
                  </span>
                )}
                
                <div className="absolute top-1 right-1 flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(session);
                    }}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white p-1 rounded opacity-70 hover:opacity-100"
                  >
                    ✎
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(session.id);
                    }}
                    className="text-xs bg-gray-500 hover:bg-gray-600 text-white p-1 rounded opacity-70 hover:opacity-100"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionManager;
