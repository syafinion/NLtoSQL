import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface SQLDisplayProps {
  sql: string;
  modelUsed: string;
  executionTime: number;
  explanation?: string;
  reasoningSteps?: string[];
  results?: string;
  visualization?: string;
  onExecuteQuery?: () => void;
  isExecuting?: boolean;
}

const SQLDisplay: React.FC<SQLDisplayProps> = ({ 
  sql, 
  modelUsed, 
  executionTime, 
  explanation,
  reasoningSteps,
  results,
  visualization,
  onExecuteQuery,
  isExecuting = false
}) => {
  const codeRef = useRef<HTMLElement>(null);
  const hasResults = results && results !== "[]";
  const parsedResults = hasResults ? JSON.parse(results || "[]") : [];
  
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [sql]);
  
  const renderTable = () => {
    if (!hasResults || parsedResults.length === 0) {
      return <p className="text-sm text-muted-foreground p-4">No results to display</p>;
    }
    
    const headers = Object.keys(parsedResults[0]);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              {headers.map((header, idx) => (
                <th key={idx} className="border px-4 py-2 text-left text-sm font-medium">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsedResults.map((row: any, rowIdx: number) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                {headers.map((header, cellIdx) => (
                  <td key={cellIdx} className="border px-4 py-2 text-sm">
                    {row[header]?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderReasoningSteps = () => {
    if (!reasoningSteps || reasoningSteps.length === 0) {
      return <p className="text-sm text-muted-foreground p-4">No reasoning steps available</p>;
    }
    
    return (
      <div className="space-y-4 p-4">
        {reasoningSteps.map((step, index) => (
          <div key={index} className="border rounded-md p-3 bg-muted/20">
            <h4 className="font-medium text-sm mb-1">Step {index + 1}</h4>
            <p className="text-sm whitespace-pre-line">{step}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderVisualization = () => {
    if (!visualization) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-muted-foreground">No visualization available</p>
          <p className="text-xs text-muted-foreground mt-1">Execute the query to generate visualization</p>
        </div>
      );
    }
    
    return (
      <div className="flex justify-center p-4">
        <img src={visualization} alt="Query result visualization" className="max-w-full h-auto" />
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
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
      <CardContent className="p-0 flex-grow overflow-auto">
        <Tabs defaultValue="query" className="w-full h-full flex flex-col">
          <TabsList className="w-full justify-start border-b bg-transparent p-0 rounded-none">
            <TabsTrigger value="query" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Query
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Reasoning
            </TabsTrigger>
            <TabsTrigger value="results" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Results
            </TabsTrigger>
            <TabsTrigger value="visualization" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
              Visualization
            </TabsTrigger>
            {explanation && (
              <TabsTrigger value="explanation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Explanation
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="query" className="flex-grow data-[state=active]:flex flex-col mt-0 border-none p-0">
            <div className="bg-black rounded-b-md overflow-hidden flex-grow">
              <pre className="p-4 text-sm overflow-x-auto h-full">
                <code ref={codeRef} className="language-sql">
                  {sql}
                </code>
              </pre>
            </div>
            
            {onExecuteQuery && (
              <div className="p-4 border-t">
                <Button 
                  onClick={onExecuteQuery} 
                  disabled={isExecuting}
                  className="w-full"
                >
                  {isExecuting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Executing Query...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Execute Query
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reasoning" className="flex-grow data-[state=active]:flex flex-col mt-0 border-none p-0">
            {renderReasoningSteps()}
          </TabsContent>
          
          <TabsContent value="results" className="flex-grow data-[state=active]:flex flex-col mt-0 border-none p-0">
            {hasResults ? (
              renderTable()
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <p className="text-sm text-muted-foreground">No results to display</p>
                <p className="text-xs text-muted-foreground mt-1">Execute the query to see results</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="visualization" className="flex-grow data-[state=active]:flex flex-col mt-0 border-none p-0">
            {renderVisualization()}
          </TabsContent>
          
          {explanation && (
            <TabsContent value="explanation" className="flex-grow data-[state=active]:flex flex-col mt-0 border-none p-0">
              <div className="p-4">
                <h3 className="text-sm font-medium mb-2">SQL Explanation</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{explanation}</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SQLDisplay; 