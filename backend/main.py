from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import os

app = FastAPI(title="Natural Language to SQL API")

# Add CORS middleware to allow frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# For hackathon, we'll use HuggingFace's free inference API
# You'll need to get a free token from huggingface.co
# In a real app, store this securely in environment variables
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/defog/sqlcoder-7b-2"
HUGGINGFACE_API_TOKEN = os.environ.get("HUGGINGFACE_API_TOKEN", "hf_dummy_token")  # Replace with your token

@app.get("/")
async def root():
    return {"message": "Natural Language to SQL API is running. Go to /docs for documentation."}

@app.post("/generate_sql")
async def generate_sql(request: Request):
    data = await request.json()
    question = data.get("question", "")
    
    if not question:
        return {"error": "No question provided"}
    
    # For demo purposes, we'll include a sample database schema
    # In a real app, you would store and manage schemas properly
    schema = """
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
    
    # Prepare the prompt for the model
    prompt = f"""
    ### SQL Table Definitions:
    {schema}
    
    ### User Question:
    {question}
    
    ### SQL Query:
    """
    
    try:
        # Call HuggingFace API
        headers = {"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"}
        response = requests.post(
            HUGGINGFACE_API_URL,
            headers=headers,
            json={"inputs": prompt}
        )
        
        if response.status_code != 200:
            return {"sql": f"Error: API returned status code {response.status_code}"}
            
        result = response.json()
        
        # For demonstration, if we can't access the API, return a sample response
        if isinstance(result, dict) and "error" in result:
            # Fallback for demo purposes
            if "find all customers" in question.lower():
                return {"sql": "SELECT * FROM customers;"}
            elif "total sales" in question.lower():
                return {"sql": "SELECT SUM(total_amount) AS total_sales FROM orders;"}
            else:
                return {"sql": "-- Could not generate SQL. Please try again or rephrase your question.\n-- HuggingFace API error: " + str(result.get("error"))}
        
        # Extract the SQL from the response
        sql = result[0]["generated_text"] if isinstance(result, list) else str(result)
        
        # Clean up the response if needed
        if "### SQL Query:" in sql:
            sql = sql.split("### SQL Query:")[1].strip()
            
        return {"sql": sql}
        
    except Exception as e:
        # For demo purposes, provide sample responses if API fails
        if "find all customers" in question.lower():
            return {"sql": "SELECT * FROM customers;"}
        elif "total sales" in question.lower():
            return {"sql": "SELECT SUM(total_amount) AS total_sales FROM orders;"}
        else:
            return {"sql": f"-- Error generating SQL: {str(e)}\n-- For demo purposes, try asking about 'customers' or 'total sales'"}

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 