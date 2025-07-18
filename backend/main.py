from fastapi import FastAPI, Request, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import os
import json
import re
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time
from huggingface_hub import InferenceClient
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid
import datetime

# Define data models
class Schema(BaseModel):
    name: str
    definition: str

class QueryHistory(BaseModel):
    id: str
    question: str
    sql: str
    timestamp: str
    model_used: str
    execution_time: float
    status: str = "success"

class GenerateSQLRequest(BaseModel):
    question: str
    schema_name: Optional[str] = None

class GenerateSQLResponse(BaseModel):
    sql: str
    model: str
    explanation: Optional[str] = None
    visualization_suggestion: Optional[str] = None
    query_id: str
    execution_time: float

app = FastAPI(
    title="NL2SQL AI",
    description="Convert natural language to SQL queries using AI",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a thread pool for running API calls
executor = ThreadPoolExecutor(max_workers=1)

# HuggingFace API settings
HF_API_TOKEN = os.environ.get("HUGGINGFACE_API_TOKEN", "")

# SQL specialized models to try
SQL_MODELS = {
    "default": "HuggingFaceH4/zephyr-7b-beta",  # Fallback model
    "sqlcoder": "defog/llama-3-sqlcoder-8b",    # Primary SQL model
    "sqlcoder7b": "defog/sqlcoder-7b-2",        # Alternative SQL model
    "spider": "gaussalgo/T5-LM-Large-text2sql-spider"  # Small text-to-SQL model
}

# Get selected model from environment variable or use default
SELECTED_MODEL = os.environ.get("SELECTED_MODEL", "sqlcoder")
if SELECTED_MODEL not in SQL_MODELS:
    print(f"Warning: Unknown model '{SELECTED_MODEL}'. Falling back to 'sqlcoder'")
    SELECTED_MODEL = "sqlcoder"

MODEL_NAME = SQL_MODELS[SELECTED_MODEL]

print(f"Using HuggingFace Hub with primary model: {MODEL_NAME}")
print(f"Will try alternate models if the primary model fails")

if not HF_API_TOKEN:
    print("WARNING: No HuggingFace API token provided. API calls may be rate limited or rejected.")
    print("Set the HUGGINGFACE_API_TOKEN environment variable with your token.")

# In-memory database for schemas and query history
SCHEMAS = {
    "default": Schema(
        name="default",
        definition="""
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    join_date DATE
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10, 2)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10, 2),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
"""
    ),
    "hr": Schema(
        name="hr",
        definition="""
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone_number VARCHAR(20),
    hire_date DATE,
    job_id INT,
    salary DECIMAL(10, 2),
    commission_pct DECIMAL(4, 2),
    manager_id INT,
    department_id INT
);

CREATE TABLE departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(100),
    manager_id INT,
    location_id INT
);

CREATE TABLE jobs (
    job_id INT PRIMARY KEY,
    job_title VARCHAR(100),
    min_salary DECIMAL(10, 2),
    max_salary DECIMAL(10, 2)
);

CREATE TABLE job_history (
    employee_id INT,
    start_date DATE,
    end_date DATE,
    job_id INT,
    department_id INT,
    PRIMARY KEY (employee_id, start_date)
);
"""
    ),
    "library": Schema(
        name="library",
        definition="""
CREATE TABLE books (
    book_id INT PRIMARY KEY,
    title VARCHAR(200),
    author_id INT,
    publisher_id INT,
    publication_year INT,
    isbn VARCHAR(20),
    genre VARCHAR(50),
    available_copies INT
);

CREATE TABLE authors (
    author_id INT PRIMARY KEY,
    name VARCHAR(100),
    birth_year INT,
    nationality VARCHAR(50)
);

CREATE TABLE publishers (
    publisher_id INT PRIMARY KEY,
    name VARCHAR(100),
    location VARCHAR(100)
);

CREATE TABLE borrowers (
    borrower_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    join_date DATE
);

CREATE TABLE loans (
    loan_id INT PRIMARY KEY,
    book_id INT,
    borrower_id INT,
    loan_date DATE,
    return_date DATE,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id)
);
"""
    )
}

QUERY_HISTORY = []

@app.get("/")
async def root():
    return {
        "message": "NL2SQL AI API is running. Go to /docs for documentation.",
        "model": MODEL_NAME,
        "version": "1.0.0"
    }

@app.get("/models")
async def list_models():
    """List all available models and the currently selected one"""
    return {
        "models": SQL_MODELS,
        "current_model": MODEL_NAME
    }

@app.get("/schemas", response_model=List[str])
async def get_schemas():
    """Get all available database schemas"""
    return list(SCHEMAS.keys())

@app.get("/schemas/{name}", response_model=Schema)
async def get_schema(name: str):
    """Get a specific database schema"""
    if name not in SCHEMAS:
        raise HTTPException(status_code=404, detail="Schema not found")
    return SCHEMAS[name]

@app.post("/schemas", response_model=Schema)
async def create_schema(schema: Schema):
    """Create a new database schema"""
    if schema.name in SCHEMAS:
        raise HTTPException(status_code=400, detail="Schema already exists")
    SCHEMAS[schema.name] = schema
    return schema

@app.get("/history", response_model=List[QueryHistory])
async def get_history():
    """Get query history"""
    return QUERY_HISTORY

# Function to generate an SQL explanation using the AI model
async def generate_explanation(sql: str, schema: str):
    try:
        # Handle empty or error SQL input
        if not sql or sql.startswith("-- Error"):
            return "No explanation available because the SQL generation failed."
            
        client = InferenceClient(api_key=HF_API_TOKEN)
        
        messages = [
            {
                "role": "system",
                "content": f"You are an expert SQL teacher. Explain the following SQL query in simple terms that a non-technical person could understand. Be concise but thorough."
            },
            {
                "role": "user",
                "content": f"Database schema:\n{schema}\n\nSQL query:\n{sql}\n\nExplain this query in simple terms."
            }
        ]
        
        try:
            completion = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.3,
                max_tokens=300
            )
            return completion.choices[0].message.content.strip()
        except:
            # Fall back to zephyr if the main model fails
            try:
                completion = client.chat.completions.create(
                    model="HuggingFaceH4/zephyr-7b-beta",
                    messages=messages,
                    temperature=0.3,
                    max_tokens=300
                )
                return completion.choices[0].message.content.strip()
            except:
                return "Could not generate explanation due to model error."
    except Exception as e:
        print(f"Error generating explanation: {str(e)}")
        return "Could not generate explanation."

# Function to suggest a visualization for the query
async def suggest_visualization(sql: str, question: str):
    try:
        # Handle empty or error SQL input
        if not sql or sql.startswith("-- Error"):
            return "No visualization suggestions available because the SQL generation failed."
            
        client = InferenceClient(api_key=HF_API_TOKEN)
        
        messages = [
            {
                "role": "system",
                "content": "You are a data visualization expert. For the given SQL query and natural language question, suggest the most appropriate visualization type (e.g., bar chart, line chart, pie chart, table) and explain why it's suitable. Be brief and focused."
            },
            {
                "role": "user",
                "content": f"Question: {question}\n\nSQL query: {sql}\n\nWhat's the most appropriate visualization for this data?"
            }
        ]
        
        try:
            completion = client.chat.completions.create(
                model="HuggingFaceH4/zephyr-7b-beta",  # Using zephyr for visualization suggestions
                messages=messages,
                temperature=0.3,
                max_tokens=150
            )
            return completion.choices[0].message.content.strip()
        except Exception as viz_error:
            print(f"Visualization suggestion error: {viz_error}")
            return "A tabular view would be appropriate for this query."
    except Exception as e:
        print(f"Error generating visualization suggestion: {str(e)}")
        return "A tabular view would be appropriate for this query."

# Function to call HuggingFace using InferenceClient
def generate_sql_with_api(prompt, schema_content):
    start_time = time.time()  # Move this to the beginning to ensure it's always defined
    
    try:
        # Extract the question from the prompt
        match = re.search(r"### User Question:\s*(.*?)\s*\n\s*### SQL Query:", prompt, re.DOTALL)
        if not match:
            return "-- Error: Could not extract question from prompt", "error", time.time() - start_time
        
        question = match.group(1).strip()
        
        # Initialize the inference client with the API token
        client = InferenceClient(api_key=HF_API_TOKEN)
        
        # Prepare messages for the chat API with a much more specific system prompt
        messages = [
            {
                "role": "system", 
                "content": f"""You are an expert SQL developer that writes clean, efficient SQL queries.

Database Schema:
{schema_content}

Instructions:
1. Generate ONLY ONE SQL query for the user's question
2. Provide ONLY the SQL code with no explanations, comments, or extra text
3. Do not include multiple examples or variations
4. Do not add 'Generate a SQL query for:' or similar phrases
5. Your response should contain ONLY the SQL query and nothing else"""
            },
            {
                "role": "user",
                "content": f"Write a SQL query to: {question}"
            }
        ]
        
        print(f"Sending request using InferenceClient with model {MODEL_NAME}...")
        
        completion = None  # Initialize completion to avoid None reference errors
        model_used = "error"  # Default value in case of errors
        
        try:
            # Try the primary model first
            completion = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.1,
                max_tokens=300
            )
            model_used = MODEL_NAME
        except Exception as primary_error:
            print(f"Primary model failed: {primary_error}")
            print("Trying alternate model...")
            
            # If primary model fails, try zephyr model which we know works
            try:
                alternate_model = "HuggingFaceH4/zephyr-7b-beta"
                completion = client.chat.completions.create(
                    model=alternate_model,
                    messages=messages,
                    temperature=0.1,
                    max_tokens=300
                )
                model_used = alternate_model
            except Exception as alt_error:
                # Try with direct API call to the router as a last resort
                print(f"Alternate model failed: {alt_error}")
                print("Trying router API directly...")
                
                router_url = "https://router.huggingface.co/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {HF_API_TOKEN}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": "HuggingFaceH4/zephyr-7b-beta",  # Use the known working model
                    "messages": messages,
                    "temperature": 0.1,
                    "max_tokens": 300,
                    "stream": False
                }
                
                try:
                    response = requests.post(router_url, headers=headers, json=payload, timeout=60)
                    response.raise_for_status()
                    result = response.json()
                    
                    if "choices" in result and len(result["choices"]) > 0:
                        completion = result
                        model_used = "router:HuggingFaceH4/zephyr-7b-beta"
                    else:
                        print(f"Router API returned unexpected format: {json.dumps(result)}")
                        return "-- Error: Router API returned unexpected format", "error", time.time() - start_time
                except Exception as router_error:
                    print(f"Router API call failed: {router_error}")
                    return f"-- Error: All model attempts failed. Last error: {router_error}", "error", time.time() - start_time
        
        elapsed_time = time.time() - start_time
        print(f"Request completed in {elapsed_time:.2f} seconds using model: {model_used}")
        
        # Check if completion is None before proceeding
        if completion is None:
            return "-- Error: Could not get a valid response from any model", "error", elapsed_time
        
        # Extract the SQL from the response
        sql_text = ""
        try:
            # Debug information to help diagnose the issue
            print(f"Completion type: {type(completion)}")
            
            if hasattr(completion, "choices"):
                print(f"Has choices attribute, choices type: {type(completion.choices)}")
                if hasattr(completion.choices, "__len__") and len(completion.choices) > 0:
                    # For InferenceClient responses
                    sql_text = completion.choices[0].message.content.strip()
                else:
                    print("Completion has choices attribute but it's empty or not iterable")
                    return "-- Error: Empty choices in model response", "error", elapsed_time
            elif isinstance(completion, dict):
                print(f"Is dict, keys: {completion.keys()}")
                if "choices" in completion:
                    print(f"Dict has choices key, type: {type(completion['choices'])}")
                    if isinstance(completion["choices"], list) and len(completion["choices"]) > 0:
                        # For direct router API responses
                        if "message" in completion["choices"][0] and "content" in completion["choices"][0]["message"]:
                            sql_text = completion["choices"][0]["message"]["content"].strip()
                        else:
                            print(f"Missing message or content in choices[0]: {completion['choices'][0]}")
                            return "-- Error: Invalid response format from model", "error", elapsed_time
                    else:
                        print("Dict has choices key but it's empty or not a list")
                        return "-- Error: Empty choices list in model response", "error", elapsed_time
                else:
                    print("Dict does not have choices key")
                    return "-- Error: No choices in model response", "error", elapsed_time
            else:
                print(f"Unexpected completion type: {type(completion)}")
                return "-- Error: Unexpected response format from model", "error", elapsed_time
        except Exception as extract_error:
            print(f"Error extracting SQL from response: {extract_error}")
            print(f"Completion: {completion}")
            return f"-- Error extracting SQL: {extract_error}", "error", elapsed_time
        
        if not sql_text:
            return "-- Error: Empty response from model", "error", elapsed_time
            
        # Enhanced post-processing to extract clean SQL
        
        # If response contains multiple SQL queries, extract just the first one
        try:
            if "SELECT" in sql_text and sql_text.count("SELECT") > 1:
                # Try to find the first complete SQL query
                first_select = sql_text.find("SELECT")
                next_select = sql_text.find("SELECT", first_select + 1)
                
                if next_select > -1:
                    sql_text = sql_text[first_select:next_select].strip()
            
            # Remove any "Generate a SQL query for:" or similar text
            prefixes_to_remove = [
                "Generate a SQL query for:",
                "SQL query:",
                "Here's a SQL query to",
                "The SQL query is:",
            ]
            
            for prefix in prefixes_to_remove:
                if sql_text.startswith(prefix):
                    sql_text = sql_text[len(prefix):].strip()
            
            # Remove any explanatory text before the SQL
            if "SELECT" in sql_text and not sql_text.strip().startswith("SELECT"):
                select_pos = sql_text.find("SELECT")
                if select_pos > 0:
                    sql_text = sql_text[select_pos:].strip()
            
            # Clean up the response to extract just the SQL code
            sql_lines = []
            for line in sql_text.split('\n'):
                if line.strip() and not line.strip().startswith('--') and not line.strip().startswith('#'):
                    sql_lines.append(line)
                    
            sql = '\n'.join(sql_lines).strip()
            
            # Final check for output cleanliness
            if "Generate" in sql or "query for:" in sql:
                # If we still have phrases like "Generate SQL" in output, try more aggressive cleaning
                parts = re.split(r'Generate|query for:', sql)
                for part in parts:
                    if "SELECT" in part:
                        select_pos = part.find("SELECT")
                        if select_pos >= 0:
                            sql = part[select_pos:].strip()
                            break
            
            # Check if we have a valid SQL query
            if not sql:
                return "-- Error: Failed to extract valid SQL from model response", "error", elapsed_time
                
            return sql, model_used, elapsed_time
        except Exception as process_error:
            print(f"Error processing model output: {process_error}")
            return f"-- Error processing model output: {str(process_error)}", "error", elapsed_time
        
    except Exception as e:
        print(f"Error generating SQL: {str(e)}")
        elapsed_time = time.time() - start_time if 'start_time' in locals() else 0
        return f"-- Error generating SQL: {str(e)}\n-- Falling back to rule-based generation", "error", elapsed_time

@app.post("/generate_sql", response_model=GenerateSQLResponse)
async def generate_sql(request: GenerateSQLRequest):
    """Generate an SQL query from a natural language question"""
    question = request.question
    
    if not question:
        raise HTTPException(status_code=400, detail="No question provided")
    
    # Get the selected schema
    schema_name = request.schema_name or "default"
    if schema_name not in SCHEMAS:
        raise HTTPException(status_code=404, detail=f"Schema '{schema_name}' not found")
    
    schema = SCHEMAS[schema_name]
    
    # Prepare the prompt for the model
    prompt = f"""
    ### SQL Table Definitions:
    {schema.definition}
    
    ### User Question:
    {question}
    
    ### SQL Query:
    """
    
    try:
        # Run API call in a separate thread to avoid blocking
        loop = asyncio.get_event_loop()
        sql, model_used, execution_time = await loop.run_in_executor(
            executor, 
            generate_sql_with_api, 
            prompt, 
            schema.definition
        )
        
        # Generate unique ID for the query
        query_id = str(uuid.uuid4())
        
        # Generate explanation and visualization suggestion only if SQL generation was successful
        if model_used != "error" and sql and not sql.startswith("-- Error"):
            # Generate explanation in the background
            explanation_task = asyncio.create_task(generate_explanation(sql, schema.definition))
            
            # Generate visualization suggestion in the background
            viz_task = asyncio.create_task(suggest_visualization(sql, question))
            
            # Wait for explanation and visualization suggestion
            explanation = await explanation_task
            visualization_suggestion = await viz_task
        else:
            explanation = "Unable to generate explanation because SQL generation failed."
            visualization_suggestion = "Unable to suggest visualization because SQL generation failed."
        
        # Add to query history
        QUERY_HISTORY.append(QueryHistory(
            id=query_id,
            question=question,
            sql=sql,
            timestamp=datetime.datetime.now().isoformat(),
            model_used=model_used,
            execution_time=execution_time,
            status="success"
        ))
        
        # Limit history length
        if len(QUERY_HISTORY) > 50:
            QUERY_HISTORY.pop(0)
        
        return {
            "sql": sql,
            "model": model_used,
            "explanation": explanation,
            "visualization_suggestion": visualization_suggestion,
            "query_id": query_id,
            "execution_time": execution_time
        }
            
    except Exception as e:
        print(f"Error generating SQL: {str(e)}")
        return HTTPException(status_code=500, detail=str(e))
    
    # Fallback: Rule-based SQL generation if API call failed
    question_lower = question.lower()
    
    # Simple rule-based SQL generation
    if any(keyword in question_lower for keyword in ["all customer", "all customers", "show customer", "list customer"]):
        sql = "SELECT * FROM customers;"
    
    elif any(keyword in question_lower for keyword in ["total sale", "total sales", "sum of sales"]):
        sql = "SELECT SUM(total_amount) AS total_sales FROM orders;"
    
    elif re.search(r"customer.*(order|purchase)", question_lower) or re.search(r"order.*(customer|by)", question_lower):
        sql = """
SELECT c.customer_id, c.name, o.order_id, o.order_date, o.total_amount
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
ORDER BY c.customer_id, o.order_date DESC;
"""
    
    elif re.search(r"(popular|top|best).*(product|selling)", question_lower) or "most sold" in question_lower:
        sql = """
SELECT p.product_id, p.name, p.category, SUM(oi.quantity) as total_sold
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.name, p.category
ORDER BY total_sold DESC
LIMIT 10;
"""
    
    elif "average" in question_lower and "price" in question_lower:
        sql = "SELECT category, AVG(price) as average_price FROM products GROUP BY category;"
    
    else:
        sql = "-- Could not generate SQL for this question using rule-based approach"
    
    # Generate unique ID for the query
    query_id = str(uuid.uuid4())
    
    # Add to query history
    QUERY_HISTORY.append(QueryHistory(
        id=query_id,
        question=question,
        sql=sql,
        timestamp=datetime.datetime.now().isoformat(),
        model_used="rule-based",
        execution_time=0.0,
        status="fallback"
    ))
    
    return {
        "sql": sql,
        "model": "rule-based",
        "explanation": "This SQL query was generated using simple rule-based matching because the AI model failed.",
        "visualization_suggestion": "A tabular view would be appropriate for this query.",
        "query_id": query_id,
        "execution_time": 0.0
    }

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 