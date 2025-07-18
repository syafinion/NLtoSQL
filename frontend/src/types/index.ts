// Define all interfaces used in the application

export interface Schema {
  name: string;
  definition: string;
}

export interface QueryHistory {
  id: string;
  question: string;
  sql: string;
  timestamp: string;
  model_used: string;
  execution_time: number;
  status?: string;
}

export interface SQLGenerationResponse {
  sql: string;
  model: string;
  explanation?: string;
  visualization_suggestion?: string;
  query_id: string;
  execution_time: number;
}

export interface ExampleQueries {
  [key: string]: string[];
} 