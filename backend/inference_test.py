import requests
import os
import json

# Get the token from environment variable
token = os.environ.get("HUGGINGFACE_API_TOKEN")
if not token:
    token = "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"

print(f"Using HuggingFace API token: {token[:4]}...{token[-4:] if len(token) > 8 else ''}")

# Try with a text-generation model that's known to work with inference API
models_to_try = [
    "meta-llama/Llama-2-7b-chat-hf",  # Very popular chat model
    "bigcode/starcoder",              # Code generation model
    "microsoft/phi-2",                # Small but effective model
    "mistralai/Mixtral-8x7B-Instruct-v0.1"  # Known to work well
]

headers = {"Authorization": f"Bearer {token}"}

for model in models_to_try:
    print(f"\n\nTesting model: {model}")
    url = f"https://api-inference.huggingface.co/models/{model}"
    
    # Text generation models typically work with a simple prompt
    payload = {"inputs": "Write a simple SQL query to select all users:"}
    
    try:
        print("Sending request...")
        response = requests.post(url, headers=headers, json=payload, timeout=45)
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! Response:")
            try:
                output = response.json()
                # Print first 200 chars to keep output readable
                print(json.dumps(output)[:200] + "...")
            except:
                print(response.text[:200] + "...")
        elif response.status_code == 503 and "currently loading" in response.text:
            print("⏳ Model is still loading. This is normal for large models.")
            print("Try again in a few minutes.")
        else:
            print(f"❌ Failed with response: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\nIf any model succeeded, update docker-compose.yml to use that model.") 