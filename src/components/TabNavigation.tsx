import React from 'react';
import { Layers, Play } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'ODA' | 'videoaula';
  onTabChange: (tab: 'ODA' | 'videoaula') => void;
  odaCount: number;
  videoaulaCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  odaCount,
  videoaulaCount
}) => {
  const tabs = [
    {
      id: 'ODA' as const,
      label: 'ODAs',
      icon: Layers,
      count: odaCount,
      color: 'text-green-600'
    },
    {
      id: 'videoaula' as const,
      label: 'Videoaulas',
      icon: Play,
      count: videoaulaCount,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-gray-400'}`} />
            <span>{tab.label}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              isActive ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};