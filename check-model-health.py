# The script is used to check if an LLM model is healthy or not.
# How to run it:
# python3 check-model-health.py <model_id>

import json
import os
import random
import sys
import time
from typing import Dict


class ModelConfig:
    def __init__(self, model_data):
        self.id = model_data['id']
        self.name = model_data['name']
        self.endpoint = model_data['endpoint']
        self.apiKey = model_data['apiKey']
        self.mockAvailablity = model_data['mockAvailablity']
        self.latency = model_data['latency']

def read_config() -> Dict[str, ModelConfig]:
    try:
        script_dir = os.path.dirname(__file__)
    except NameError:
        # __file__ not available when executed via exec()
        script_dir = os.getcwd()
    models_path = os.path.join(script_dir, 'models.json')

    with open(models_path, 'r') as f:
        models_data = json.load(f)
    return {model['id']: ModelConfig(model) for model in models_data}


# Initial an interview with an LLM model by model ID
def initiateInterview(model: ModelConfig):
    """
    Simulates starting an interview by making a test completion request.
    Returns:
        0: Success - interview initiated successfully
        1: Failure - model call failed
    """
    
    # Simulate network latency
    time.sleep(model.latency)

    # Simulate success/failure based on mock availability rate
    if random.random() < model.mockAvailablity:
        return 0  # Success
    else:
        return 1  # Failure

def help():
    print("""
LLM Health Monitor - Check Model Health Status

DESCRIPTION:
    This script simulates starting an interview with a Large Language Model (LLM)
    by making a test completion request. It checks model availability and latency.

USAGE:
    python3 check-model-health.py <model_id>

ARGUMENTS:
    model_id    The ID of the model to test (e.g., gpt-4o, claude-3-opus)

RETURN CODES:
    0    Success - Interview initiated successfully
    1    Failure - Model call failed (due to availability rate)
    2    Error - Model not found

AVAILABLE MODELS:
    The script loads models from models.json. Common model IDs include:
    - gpt-4o, gpt-4, gpt-3.5-turbo
    - claude-3-opus, claude-4-sonnet, claude-3-haiku
    - gemini-pro, llama-2-70b, palm-2, mistral-large

EXAMPLES:
    python3 check-model-health.py gpt-4o
    python3 check-model-health.py claude-3-opus
           """)

def main():
    # Read model ID from command line
    if len(sys.argv) < 2:
        help()
        return 2  # Missing model ID

    model_id = sys.argv[1]

    configs = read_config()
    model = configs.get(model_id)

    if model is None:
        return 2  # Model not found

    # Call initiateInterview and return status code accordingly
    return initiateInterview(model)

if __name__ == "__main__":
    sys.exit(main())
