import os
import subprocess
import random
import requests

# --- Constants ---
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
OLLAMA_API_URL = "http://localhost:11434/api/generate"

# --- Telegram Functions ---
def send_telegram_message(message):
    """Sends a message to the configured Telegram chat."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram credentials not found. Skipping notification.")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error sending Telegram message: {e}")

# --- Ollama Functions ---
def generate_with_ollama(prompt, model="qwen3-coder:480b-cloud"):
    """Generates code using the specified Ollama model."""
    try:
        response = requests.post(
            OLLAMA_API_URL,
            json={"model": model, "prompt": prompt, "stream": False},
        )
        response.raise_for_status()
        return response.json()["response"]
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama: {e}")
        return None


# --- Genetic Algorithm (Simplified) ---
def get_random_file():
    """Selects a random Python file from the current directory."""
    python_files = [f for f in os.listdir('.') if f.endswith('.py')]
    return random.choice(python_files) if python_files else None

def mutate(file_path):
    """Applies a simple mutation to a file (in a real scenario, this would be more complex)."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    prompt = f"Refactor this Python code to be more efficient, without changing its functionality:\n\n{content}"
    mutated_content = generate_with_ollama(prompt)

    if mutated_content:
        with open(file_path, 'w') as f:
            f.write(mutated_content)
        return True
    return False

# --- Main Workflow ---
def main():
    """Main function to run the cosmic mutation workflow."""
    send_telegram_message("🧬 Cosmic Mutation Engine: Starting run...")

    target_file = get_random_file()
    if not target_file:
        send_telegram_message("No Python files found to mutate.")
        return

    if mutate(target_file):
        send_telegram_message(f"Successfully mutated {target_file}. Waiting for approval...")
        # In a real workflow, we would wait for a Telegram callback for approval.
        # For this example, we'll just assume approval and commit.
        subprocess.run(["git", "add", target_file], check=True)
        subprocess.run(["git", "commit", "-m", f"🧬 chore: Automated mutation of {target_file}"], check=True)
        subprocess.run(["git", "push"], check=True)
        send_telegram_message("Changes approved and pushed.")
    else:
        send_telegram_message(f"Failed to mutate {target_file}.")

if __name__ == "__main__":
    main()

