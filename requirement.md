# Take Home Assessment – Take2 AI

## Role : Senior Software Engineer

# Background

Take2 AI builds conversational Voice AI agents that conduct structured interviews.

These agents use a variety of Large Language Models (LLMs) such as OpenAI GPT-4o and Anthropic Claude Sonnet 4\.  
Each interview simulation has a corresponding configuration that specifies a primary model.

Latencies and availability can vary across providers and over time.  
When models degrade or go offline, this can lead to failed or delayed interview sessions.

To improve reliability, we want to automatically detect unhealthy models and gracefully fall back to a healthy one when starting an interview.

# Goal

Build a system that continuously monitors the “health” of multiple LLMs used in Take2 AI’s simulations.  
If an interview is initiated with a model that is currently unhealthy, the system should automatically use a secondary healthy model instead and record that fallback event.

The system should test the availability and latency of models using the model providers’ public APIs.

# Required Tech Stack

Here are requirements on parts of the tech stack and the division of responsibilities between them:

Python

* Handles all calls to LLMs  
* Mock initiation of an interview while accepting a simulation configuration  
  * Example :   
  * def initiateInterview(...):  
  * """Simulates starting an interview by making a test completion request."""

[Node.js](http://Node.js)

* Run a local server (Express recommended).  
* All state management \- including model health and configuration

# Guidelines

**Expected Time to Complete**

* Plan for 4 hours of focused work  
* Do not exceed 4 hours  
* Prioritize core functionality  
* Submit what you have at the end of the timebox  
* Call out TODOs and design notes in documentation

**Implementation Expectations**

We are not expecting all parts of this system to be built out.  
Stub or mock whatever API calls or parts of the system you deem appropriate — including calls to LLMs — as you decide how best to make use of your time.

Try to build out the structure, implement some parts end-to-end, and mock/stub/describe the rest.  
It is important to get some parts built out and working to assess your ability to build and code.  
But we do not expect that everything will be complete.

# How you’ll be Evaluated

1. Working Implementation  
* Includes some working examples or sufficient prototypes demonstrating system behavior  
* Shows ability to build, run, and verify at least one meaningful flow end-to-end  
2. Code Quality  
   * Clean, well-organized structure  
3. Design Clarity and Completeness  
* Completeness and clarity of the overall design

# Deliverables

GitHub repo link(s) with README containing

* Setup instructions (how to run Node server \+ Python “agent”)  
* brief design notes  
* Any assumptions and trade-offs
