import requests
import os
import sys

# Get the token from environment variable
token = os.environ.get("HUGGINGFACE_API_TOKEN")
if not token:
    print("Error: HUGGINGFACE_API_TOKEN environment variable not set")
    sys.exit(1)

# List of models to check
models = [
    "defog/sqlcoder",
    "defog/sqlcoder-7b-2",
    "defog/sqlcoder-70b",
    "facebook/bart-large",  # Different model as a control
]

for model in models:
    url = f"https://api-inference.huggingface.co/models/{model}"
    
    # First check with HEAD request (just to see if the model exists)
    try:
        head_resp = requests.head(url, headers={"Authorization": f"Bearer {token}"})
        print(f"Model: {model} - HEAD status: {head_resp.status_code}")
    except Exception as e:
        print(f"Error checking {model}: {e}")
    
    # Then try a simple inference request
    try:
        payload = {"inputs": "Convert this to SQL: Find all customers"}
        post_resp = requests.post(
            url, 
            headers={"Authorization": f"Bearer {token}"}, 
            json=payload
        )
        print(f"Model: {model} - POST status: {post_resp.status_code}")
        if post_resp.status_code == 200:
            print(f"Success! Model {model} is working")
            print(f"Response preview: {post_resp.text[:100]}...")
        else:
            print(f"Response content: {post_resp.text[:100]}")
    except Exception as e:
        print(f"Error with POST to {model}: {e}")
    
    print("-" * 50) 