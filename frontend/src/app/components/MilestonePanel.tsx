import React from 'react';

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
  return (
    <div className="bg-white text-black dark:bg-gray-800 dark:text-white p-4">
      <h3 className="text-lg font-semibold mb-2">📋 Project Plan</h3>
      {milestones.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No milestones yet.</p>
      ) : (
        <ul className="space-y-2">
          {milestones.map((milestone) => (
            <li key={milestone.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="flex justify-between items-center">
                <span>{milestone.milestone}</span>
                {milestone.status === 'pending' && (
                  <button
                    onClick={() => onComplete(milestone.id)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark done
                  </button>
                )}
              </div>
              <ul className="ml-4 list-disc text-sm text-gray-700 dark:text-gray-300">
                {milestone.tasks.map((task, idx) => (
                  <li key={idx}>{task}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MilestonePanel;
