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
  results?: string;
  visualization?: string;
  reasoning_steps?: string[];
}

export interface SQLGenerationResponse {
  sql: string;
  model: string;
  explanation?: string;
  visualization_suggestion?: string;
  query_id: string;
  execution_time: number;
  reasoning_steps?: string[];
  results?: string;
  result_visualization?: string;
}

export interface ExampleQueries {
  [key: string]: string[];
}

export interface TableRow {
  [key: string]: any;
}

export interface QueryResults {
  results?: TableRow[];
  visualization?: string;
} 