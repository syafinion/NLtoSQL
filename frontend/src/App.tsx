import React, { useState, useEffect } from 'react';
import { QueryHistory as QueryHistoryType, Schema as SchemaType, ExampleQueries, SQLGenerationResponse } from './types';

import SQLDisplay from './components/SQLDisplay';
import SchemaSelector from './components/SchemaSelector';
import QueryForm from './components/QueryForm';
import QueryHistory from './components/QueryHistory';
import InfoCard from './components/InfoCard';
import { Button } from './components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const FETCH_TIMEOUT = 120000;

// Example queries for different schemas
const EXAMPLE_QUERIES: ExampleQueries = {
  default: [
    "Show all customers who made purchases in the last month",
    "What's the total sales amount for each product category?",
    "Find the top 5 customers by total purchase amount",
    "What's the average order value per customer?",
    "List all products with their inventory status"
  ],
  hr: [
    "List all employees in the IT department",
    "Find the average salary by department",
    "Show employees who have changed jobs in the last year",
    "Which department has the highest average salary?",
    "List all managers and their department names"
  ],
  library: [
    "Show all books by author 'J.K. Rowling'",
    "Find the most borrowed books in the last month",
    "Which borrower has the most overdue books?",
    "List all books published after 2010 by genre",
    "Show the average loan duration by book genre"
  ]
};

const App: React.FC = () => {
  const [question, setQuestion] = useState<string>("");
  const [sql, setSql] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [visualization, setVisualization] = useState<string>("");
  const [reasoningSteps, setReasoningSteps] = useState<string[]>([]);
  const [queryResults, setQueryResults] = useState<string>("");
  const [resultVisualization, setResultVisualization] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [modelUsed, setModelUsed] = useState<string>("");
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [schemas, setSchemas] = useState<string[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string>("default");
  const [schemaDefinition, setSchemaDefinition] = useState<string>("");
  const [queryHistory, setQueryHistory] = useState<QueryHistoryType[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);
  const [showSchemaPanel, setShowSchemaPanel] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentQueryId, setCurrentQueryId] = useState<string>("");
  const [includeReasoning, setIncludeReasoning] = useState<boolean>(true);
  const [executeQuery, setExecuteQuery] = useState<boolean>(false);

  // Fetch schemas and history when the component mounts
  useEffect(() => {
    fetchSchemas();
    fetchHistory();
    fetchModelInfo();
  }, []);

  // Fetch schema definition when selected schema changes
  useEffect(() => {
    fetchSchemaDefinition();
  }, [selectedSchema]);

  // Function to fetch available schemas
  const fetchSchemas = async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/schemas`);
      if (response.ok) {
        const data = await response.json();
        setSchemas(data);
        if (data.length > 0 && !data.includes(selectedSchema)) {
          setSelectedSchema(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch schemas:", error);
    }
  };

  // Function to fetch schema definition
  const fetchSchemaDefinition = async (): Promise<void> => {
    if (!selectedSchema) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/schemas/${selectedSchema}`);
      if (response.ok) {
        const data = await response.json();
        setSchemaDefinition(data.definition);
      }
    } catch (error) {
      console.error(`Failed to fetch schema ${selectedSchema}:`, error);
    }
  };

  // Function to fetch query history
  const fetchHistory = async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/history`);
      if (response.ok) {
        const data = await response.json();
        setQueryHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  // Function to fetch model information
  const fetchModelInfo = async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/models`);
      if (response.ok) {
        const data = await response.json();
        setModelUsed(data.current_model);
      }
    } catch (error) {
      console.error("Failed to fetch model info:", error);
    }
  };

  // Function to fetch with timeout
  const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The model might be taking too long to process.');
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSql("");
    setExplanation("");
    setVisualization("");
    setReasoningSteps([]);
    setQueryResults("");
    setResultVisualization("");
    
    try {
      // Show a loading message
      setSql("Generating SQL... This may take up to 2 minutes.");
      
      const res = await fetchWithTimeout(
        `${BACKEND_URL}/generate_sql`, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            question,
            schema_name: selectedSchema,
            include_reasoning: includeReasoning,
            execute_query: executeQuery
          }),
        },
        FETCH_TIMEOUT
      );
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data: SQLGenerationResponse = await res.json();
      setSql(data.sql);
      setExplanation(data.explanation || "");
      setVisualization(data.visualization_suggestion || "");
      setModelUsed(data.model);
      setExecutionTime(data.execution_time);
      setCurrentQueryId(data.query_id);
      
      // Set reasoning steps if available
      if (data.reasoning_steps && data.reasoning_steps.length > 0) {
        setReasoningSteps(data.reasoning_steps);
      }
      
      // Set results if available
      if (data.results) {
        setQueryResults(data.results);
      }
      
      // Set visualization if available
      if (data.result_visualization) {
        setResultVisualization(data.result_visualization);
      }
      
      // Refresh history after generating a new query
      fetchHistory();
    } catch (err: any) {
      setError(`Failed to generate SQL: ${err.message}`);
      setSql(""); // Clear the loading message
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteQuery = async (): Promise<void> => {
    if (!currentQueryId) return;
    
    setExecuting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/execute_sql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query_id: currentQueryId,
          schema_name: selectedSchema
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setQueryResults(data.results);
      setResultVisualization(data.visualization);
      
      // Refresh history after executing
      fetchHistory();
    } catch (err: any) {
      setError(`Failed to execute query: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const loadFromHistory = (historyItem: QueryHistoryType): void => {
    setQuestion(historyItem.question);
    setSql(historyItem.sql);
    setModelUsed(historyItem.model_used);
    setExecutionTime(historyItem.execution_time);
    setCurrentQueryId(historyItem.id);
    
    // Load reasoning steps if available
    if (historyItem.reasoning_steps) {
      setReasoningSteps(historyItem.reasoning_steps);
    } else {
      setReasoningSteps([]);
    }
    
    // Load results if available
    if (historyItem.results) {
      setQueryResults(historyItem.results);
    } else {
      setQueryResults("");
    }
    
    // Load visualization if available
    if (historyItem.visualization) {
      setResultVisualization(historyItem.visualization);
    } else {
      setResultVisualization("");
    }
    
    // Close the history panel on mobile after selecting
    if (window.innerWidth <= 768) {
      setShowHistoryPanel(false);
    }
  };

  const toggleTheme = (): void => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b">
          <div className="container py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">NL2SQL AI</h1>
              <p className="text-sm text-muted-foreground">Convert natural language to SQL with AI</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </Button>
          </div>
        </header>

        {/* Mobile toggles */}
        <div className="lg:hidden border-b">
          <div className="container py-2 flex space-x-2">
            <Button 
              variant={showSchemaPanel ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowSchemaPanel(!showSchemaPanel);
                setShowHistoryPanel(false);
              }}
            >
              Database Schema
            </Button>
            <Button 
              variant={showHistoryPanel ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowHistoryPanel(!showHistoryPanel);
                setShowSchemaPanel(false);
              }}
            >
              Query History
            </Button>
          </div>
        </div>

        {/* Main content */}
        <main className="container py-6 grid gap-6 lg:grid-cols-12">
          {/* Sidebar (Schema + History) */}
          <aside className={`lg:col-span-3 lg:block ${(showSchemaPanel || showHistoryPanel) ? 'block' : 'hidden'} space-y-6`}>
            {(showSchemaPanel || !showHistoryPanel || window.innerWidth > 768) && (
              <SchemaSelector 
                schemas={schemas}
                selectedSchema={selectedSchema}
                setSelectedSchema={setSelectedSchema}
                schemaDefinition={schemaDefinition}
              />
            )}
            
            {(showHistoryPanel || window.innerWidth > 768) && (
              <QueryHistory 
                history={queryHistory}
                loadFromHistory={loadFromHistory}
                activeQueryId={currentQueryId}
              />
            )}
          </aside>

          {/* Main content area */}
          <div className={`${(showSchemaPanel || showHistoryPanel) ? 'hidden' : 'block'} lg:block lg:col-span-9 space-y-6`}>
            {/* Options Row */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeReasoning"
                  checked={includeReasoning}
                  onChange={(e) => setIncludeReasoning(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="includeReasoning" className="text-sm">Show reasoning steps</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="executeQuery"
                  checked={executeQuery}
                  onChange={(e) => setExecuteQuery(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="executeQuery" className="text-sm">Auto-execute query</label>
              </div>
            </div>

            {/* Query input form */}
            <QueryForm 
              question={question}
              setQuestion={setQuestion}
              handleSubmit={handleSubmit}
              loading={loading}
              selectedSchema={selectedSchema}
              exampleQueries={EXAMPLE_QUERIES}
            />

            {/* Error display */}
            {error && (
              <div className="p-4 border border-red-500 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-md">
                <p>{error}</p>
              </div>
            )}

            {/* SQL Result display */}
            {sql && (
              <div className="h-[500px]">
                <SQLDisplay 
                  sql={sql} 
                  modelUsed={modelUsed}
                  executionTime={executionTime}
                  explanation={explanation}
                  reasoningSteps={reasoningSteps}
                  results={queryResults}
                  visualization={resultVisualization}
                  onExecuteQuery={handleExecuteQuery}
                  isExecuting={executing}
                />
              </div>
            )}

            {/* Feature Cards */}
            <div className="grid gap-4 lg:grid-cols-3">
              <InfoCard 
                title="Step-by-Step Reasoning"
                description="See the AI's thought process as it breaks down your question into logical steps to construct the SQL query."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
              <InfoCard 
                title="Query Execution"
                description="Execute generated SQL queries against a sample database to verify results and understand the output."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <InfoCard 
                title="Automatic Visualization"
                description="Get instant data visualizations from query results to better understand relationships in your data."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t mt-12">
          <div className="container py-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Powered by LLaMA 3 Coder 8B • Natural Language to SQL AI
            </p>
            <p className="text-sm text-muted-foreground">
              Using model: {modelUsed}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App; 