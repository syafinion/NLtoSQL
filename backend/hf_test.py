import os
from huggingface_hub import HfApi, InferenceApi

# Get the token from environment variable
token = os.environ.get("HUGGINGFACE_API_TOKEN")
if not token:
    token = "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"  # Using the token from docker-compose.yml

print(f"Using HuggingFace API token: {token[:4]}...{token[-4:] if len(token) > 8 else ''}")

# First, check if we can connect to HF API at all
try:
    print("\nTesting basic API connection...")
    api = HfApi(token=token)
    # Just check if we can list some models
    models = api.list_models(limit=5)
    print("✅ Successfully connected to HuggingFace API!")
    print("Sample models available:")
    for model in models:
        print(f" - {model.id}")
except Exception as e:
    print(f"❌ Failed to connect to HuggingFace API: {e}")

# Now try inference with a simple model
model_id = "google/flan-t5-small"
try:
    print(f"\nTesting inference with {model_id}...")
    inference = InferenceApi(repo_id=model_id, token=token)
    result = inference(inputs="Translate to Spanish: Hello, how are you?")
    print(f"✅ Inference successful! Result: {result}")
except Exception as e:
    print(f"❌ Inference failed: {e}")

# Check token validity explicitly
print("\nChecking token validity...")
try:
    whoami = api.whoami()
    print(f"✅ Token is valid! User: {whoami}")
except Exception as e:
    print(f"❌ Token validation failed: {e}")
    
print("\nNOTE: If all tests failed, there might be issues with:")
print("1. Your token - check if it's expired or has proper permissions")
print("2. HuggingFace API might have changed - check documentation")
print("3. Network connectivity issues from Docker container")
print("4. Your account might need payment or permissions for inference API") 