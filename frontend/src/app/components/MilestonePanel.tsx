import React from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

export interface Milestone {
  id: number;
  milestone: string;
  tasks: string[];
  status: 'pending' | 'done';
}

interface MilestonePanelProps {
  milestones: Milestone[];
  onComplete: (id: number) => void;
}

const MilestonePanel: React.FC<MilestonePanelProps> = ({ milestones, onComplete }) => {
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">📋 Project Roadmap</h3>
        <div className="text-sm text-gray-600">
          {completedCount} of {totalCount} completed
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No milestones yet. Start a conversation to create your project plan!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.id} 
              className={`border rounded-xl p-4 transition-all duration-200 ${
                milestone.status === 'done' 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {milestone.status === 'done' ? (
                      <CheckCircleIconSolid className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 ${
                      milestone.status === 'done' ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {milestone.milestone}
                    </h4>
                    <ul className="space-y-1">
                      {milestone.tasks.map((task, idx) => (
                        <li key={idx} className={`text-sm flex items-center gap-2 ${
                          milestone.status === 'done' ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            milestone.status === 'done' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {milestone.status === 'pending' && (
                  <button
                    onClick={() => onComplete(milestone.id)}
                    className="ml-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-blue-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MilestonePanel;