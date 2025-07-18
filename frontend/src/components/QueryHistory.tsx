import React from 'react';
import { QueryHistory as QueryHistoryType } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface QueryHistoryProps {
  history: QueryHistoryType[];
  loadFromHistory: (historyItem: QueryHistoryType) => void;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ history, loadFromHistory }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Query History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {history.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">No queries yet. Ask a question to get started!</p>
          </div>
        ) : (
          <div className="divide-y">
            {history.map((item, index) => (
              <div
                key={item.id || index}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => loadFromHistory(item)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium truncate max-w-[80%]">{item.question}</h3>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {item.model_used}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadFromHistory(item);
                    }}
                  >
                    Load
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryHistory; 