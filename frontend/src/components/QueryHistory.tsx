import React from 'react';
import { QueryHistory as QueryHistoryType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface QueryHistoryProps {
  history: QueryHistoryType[];
  loadFromHistory: (historyItem: QueryHistoryType) => void;
  activeQueryId?: string;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ history, loadFromHistory, activeQueryId }) => {
  const formatDate = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Query History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {history.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">No query history yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {history.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${activeQueryId === item.id ? 'bg-muted' : ''}`}
                onClick={() => loadFromHistory(item)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.timestamp)}
                  </span>
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {(item.execution_time || 0).toFixed(1)}s
                  </span>
                </div>
                <p className="text-sm font-medium line-clamp-1">{item.question}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-mono">{item.sql}</p>
                
                {(item.results || item.visualization) && (
                  <div className="mt-2 flex items-center space-x-2">
                    {item.results && (
                      <span className="text-xs bg-green-500/10 text-green-500 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Results
                      </span>
                    )}
                    {item.visualization && (
                      <span className="text-xs bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        Visualization
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryHistory; 