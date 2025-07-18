import requests
import os

# Get the token from environment variable
token = os.environ.get("HUGGINGFACE_API_TOKEN")
if not token:
    token = "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"

# Try the newer API URL patterns
base_urls = [
    "https://api-inference.huggingface.co/models",  # Original pattern
    "https://api.huggingface.co/inference/models",  # Potential new pattern
    "https://api-inference.huggingface.co",        # Base URL
]

model = "gpt2"  # Very basic model that should work if anything works
prompt = "Hello, I am"

print(f"Testing with model: {model}")
print(f"Using HuggingFace API token: {token[:4]}...{token[-4:] if len(token) > 8 else ''}")

for base_url in base_urls:
    url = f"{base_url}/{model}"
    print(f"\nTrying URL: {url}")
    
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"inputs": prompt}
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

print("\nImportant: Visit https://huggingface.co/settings/profile to check:")
print("1. Your account status (free vs pro)")
print("2. If you need to accept model terms for specific models")
print("3. If you need a paid subscription for inference API access") 