# LLM Model Health Check

## Introduction

This project monitors the health status of LLM (Large Language Model) models used by the Take2 interview agent. It provides real-time tracking and health checks to ensure reliable model performance.

## Prerequisites

Ensure you have the following installed on your system:

- **Python 3.9+**: Required for the health check script
- **Node.js v25+**: Required for the web application

You can verify installations with:
```bash
python3 --version
node -v
```

## How to Run

1. Download or clone the repository
2. Navigate to the project directory:
   ```bash
   cd llm-health-monitor
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm start
   ```
5. Open your browser and go to `http://localhost:3000/`

## Project Structure

### check-model-health.py

A Python script that simulates and monitors the health behavior of configured LLM models. It periodically checks model availability and performance metrics.

### Express.js Application

A Node.js web application built with Express.js that provides a user interface for viewing model health status, managing configurations, and displaying real-time monitoring data.
