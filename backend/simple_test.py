import requests
import os

# Get the token from environment variable
token = os.environ.get("HUGGINGFACE_API_TOKEN")
if not token:
    token = "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"  # Using the token from docker-compose.yml

print(f"Using HuggingFace API token: {token[:4]}...{token[-4:] if len(token) > 8 else ''}")

# Try a very simple model with a simple prompt
model = "google/flan-t5-small"
url = f"https://api-inference.huggingface.co/models/{model}"

# Make a simple request
headers = {"Authorization": f"Bearer {token}"}
payload = {"inputs": "Translate to Spanish: Hello, how are you?"}

print(f"Testing model: {model}")
print(f"URL: {url}")
print("Sending request...")

try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text[:200]}")
    
    if response.status_code == 200:
        print("\nSUCCESS! Basic API connection is working.")
    else:
        print("\nAPI connection FAILED. Check your token and API access.")
        
except Exception as e:
    print(f"Error: {e}") 