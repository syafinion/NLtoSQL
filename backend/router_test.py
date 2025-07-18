import requests
import os
import json

# Get the token from environment variable
token = os.environ.get("HUGGINGFACE_API_TOKEN")
if not token:
    token = "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"

print(f"Using HuggingFace API token: {token[:4]}...{token[-4:] if len(token) > 8 else ''}")

# Use the new router endpoint for chat completions
url = "https://router.huggingface.co/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Try with some very basic models that might work with free tier
models_to_try = [
    "HuggingFaceH4/zephyr-7b-beta",  # Popular open model
    "mistralai/Mistral-7B-v0.1",      # Another popular model
    "gpt2",                          # Very basic model
    "facebook/opt-125m"              # Small model that might be free
]

for model in models_to_try:
    print(f"\n\nTesting model with router endpoint: {model}")
    
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": "Write a simple SQL query to select all users from a table named 'users'"
            }
        ],
        "stream": False
    }
    
    try:
        print("Sending request to router endpoint...")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text[:300]}")
        
        if response.status_code == 200:
            print("✅ SUCCESS!")
        else:
            print("❌ Failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\nIf you need to generate SQL, you may need to:")
print("1. Upgrade to a PRO account on HuggingFace")
print("2. Use a simple rule-based generator for SQL in your app")
print("3. Consider using a different backend approach that doesn't rely on HF Inference API") 