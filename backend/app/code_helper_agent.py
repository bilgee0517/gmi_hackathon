from utils.gmi_client import GMIChat

code_helper = GMIChat(model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B")

def handle_code_help(prompt):
    messages = [
        {"role": "system", "content": "You are a coding assistant."},
        {"role": "user", "content": prompt}
    ]
    return code_helper.chat(messages)
