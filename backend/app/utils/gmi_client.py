import os
import requests

class GMIChat:
    def __init__(self, model):
        self.api_key = os.getenv("GMI_API_KEY")
        self.model = model
        self.url = "https://api.gmi-serving.com/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def chat(self, messages, temperature=0.7, max_tokens=500):
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        response = requests.post(self.url, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
