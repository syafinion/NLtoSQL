import React from 'react';
import { ExampleQueries } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';

interface QueryFormProps {
  question: string;
  setQuestion: (question: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  selectedSchema: string;
  exampleQueries: ExampleQueries;
}

const QueryForm: React.FC<QueryFormProps> = ({
  question,
  setQuestion,
  handleSubmit,
  loading,
  selectedSchema,
  exampleQueries,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Ask a question about your data</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Show all customers who made purchases in the last month"
              required
              className="min-h-[100px] pr-12"
            />
            {question && (
              <Button
                type="button"
                onClick={() => setQuestion('')}
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Generate SQL
              </>
            )}
          </Button>
        </form>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Example Questions</h3>
          <div className="flex flex-wrap gap-2">
            {exampleQueries[selectedSchema]?.map((query, index) => (
              <Button
                key={index}
                type="button"
                onClick={() => setQuestion(query)}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                {query}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueryForm; 