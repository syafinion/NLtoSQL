import requests
import os
import sys
import time

# Get the token from environment variable
token = os.environ.get("HUGGINGFACE_API_TOKEN")
if not token:
    print("Error: HUGGINGFACE_API_TOKEN environment variable not set")
    print("Please set it using: export HUGGINGFACE_API_TOKEN=your_token_here")
    sys.exit(1)

print(f"Using HuggingFace API token: {token[:4]}...{token[-4:] if len(token) > 8 else ''}")

# Models to test for SQL generation capability
models = [
    "bigcode/starcoder"  # Popular code generation model that works with inference API
]

# Test query
test_query = """
### SQL Table Definitions:
CREATE TABLE customers (
    cyustomer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    join_date DATE
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10, 2),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

### User Question:
Show all customers who made purchases in the last month

### SQL Query:
"""

print("\n" + "="*80)
print("TESTING HUGGINGFACE INFERENCE API FOR SQL GENERATION")
print("="*80 + "\n")
print("Testing which models are available and responsive...")
print("This may take a few minutes as some models need to be loaded on HF servers.\n")

results = []

for model in models:
    url = f"https://api-inference.huggingface.co/models/{model}"
    print(f"\nTesting model: {model}")
    
    # Test with a SQL generation prompt
    try:
        payload = {
            "inputs": test_query,
            "parameters": {
                "max_new_tokens": 300,
                "do_sample": False,
                "return_full_text": True
            }
        }
        
        print("Sending API request...")
        start_time = time.time()
        
        # Try up to 3 times with increasing timeouts
        max_retries = 3
        success = False
        
        for attempt in range(max_retries):
            try:
                timeout = 30 * (attempt + 1)  # 30s, 60s, 90s
                print(f"Attempt {attempt+1}/{max_retries} with {timeout}s timeout...")
                
                response = requests.post(
                    url, 
                    headers={"Authorization": f"Bearer {token}"}, 
                    json=payload,
                    timeout=timeout
                )
                
                # If model is loading, wait and retry
                if response.status_code == 503 and "currently loading" in response.text.lower():
                    wait_time = min(20, 5 * (attempt + 1))
                    print(f"Model is loading. Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                    continue
                
                # Break on successful response
                success = True
                break
                
            except requests.exceptions.Timeout:
                print(f"Request timed out after {timeout}s")
                if attempt < max_retries - 1:
                    print("Retrying with longer timeout...")
                    continue
                else:
                    raise
        
        if not success:
            raise Exception("All retry attempts failed")
        
        elapsed_time = time.time() - start_time
        print(f"API response received in {elapsed_time:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                sql_part = generated_text[len(test_query):].strip() if generated_text.startswith(test_query) else generated_text
                
                print(f"✅ SUCCESS! Model {model} generated SQL:")
                print("-" * 50)
                print(sql_part[:500] + ("..." if len(sql_part) > 500 else ""))
                print("-" * 50)
                
                results.append({
                    "model": model,
                    "status": "SUCCESS",
                    "time": elapsed_time,
                    "sample": sql_part[:100] + "..."
                })
                
            else:
                print(f"❌ Unexpected response format: {result}")
                results.append({
                    "model": model,
                    "status": "ERROR",
                    "reason": "Unexpected response format"
                })
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            print(f"Response content: {response.text[:500]}")
            results.append({
                "model": model,
                "status": "ERROR",
                "reason": f"Status {response.status_code}: {response.text[:100]}"
            })
            
    except Exception as e:
        print(f"❌ Error with API request to {model}: {e}")
        results.append({
            "model": model,
            "status": "ERROR",
            "reason": str(e)
        })
    
    print("-" * 60)

# Print summary of results
print("\n" + "="*80)
print("SUMMARY OF RESULTS")
print("="*80)

working_models = []
for result in results:
    model = result["model"]
    status = result["status"]
    
    if status == "SUCCESS":
        response_time = f"{result['time']:.2f}s"
        working_models.append(model)
        print(f"✅ {model:<40} - Working! Response time: {response_time}")
    else:
        reason = result.get("reason", "Unknown error")
        print(f"❌ {model:<40} - Failed: {reason}")

print("\n" + "="*80)
print(f"WORKING MODELS: {len(working_models)}/{len(models)}")
print("="*80)

if working_models:
    print("The following models are working and can be used in your application:")
    for i, model in enumerate(working_models, 1):
        print(f"{i}. {model}")
else:
    print("No models are working. Please check your API token or try again later.")