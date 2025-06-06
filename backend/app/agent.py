import os
import requests
import json

# Load API key from environment variable
GMI_API_KEY = os.getenv("GMI_API_KEY")

if not GMI_API_KEY:
    raise ValueError("❌ GMI_API_KEY environment variable not set!")

url = "https://api.gmi-serving.com/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {GMI_API_KEY}"
}

payload = {
    "model": "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
    "messages": [
        {"role": "system", "content": "You are a helpful AI assistant"},
        {"role": "user", "content": "List 3 countries and their capitals."}
    ],
    "temperature": 0,
    "max_tokens": 500
}

response = requests.post(url, headers=headers, json=payload)
response.raise_for_status()  # will raise an error if something goes wrong
print(json.dumps(response.json(), indent=2))
