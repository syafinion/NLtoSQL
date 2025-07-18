import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';

interface SQLDisplayProps {
  sql: string;
  modelUsed: string;
  executionTime: number;
}

const SQLDisplay: React.FC<SQLDisplayProps> = ({ sql, modelUsed, executionTime }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [sql]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-4 py-2 bg-muted border-b">
        <span className="text-sm font-medium">SQL Query</span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            Generated in {executionTime.toFixed(2)}s using {modelUsed}
          </span>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(sql);
            }}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-black rounded-b-md overflow-hidden">
          <pre className="p-4 text-sm overflow-x-auto">
            <code ref={codeRef} className="language-sql">
              {sql}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default SQLDisplay; 