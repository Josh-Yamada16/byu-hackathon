# BYU Major Decision AI Agent

*Hackathon Project — BYU REDO Hackathon*

An intelligent AI agent designed to assist **Brigham Young University students** in exploring and selecting academic majors by analyzing BYU-specific data and providing major maps and summaries.

This project was developed as part of the **BYU REDO Hackathon** — a collaborative event where students build creative solutions to real student challenges using emerging technologies like AI.

---

## 🚀 Overview

Choosing a major is one of the most important and challenging decisions for college students. Our AI agent helps simplify this process by:

* Accessing structured data related to BYU majors, curricula, and outcomes
* Providing major summaries and class information.
* Prompting and answering follow-up questions to provide the student with more relevent information.

This tool leverages Python for backend logic and data processing, along with web or chat interfaces for user interaction.

---

## 🧠 Key Features

✔️ **AI-Powered Recommendation Engine**
Uses natural language understanding to interpret user input and match it with major options.

✔️ **Data-Driven Insights**
Incorporates major-specific data from BYU resources for accurate advising.

✔️ **Interactive Interface**
Accepts conversational input and supports dynamic follow-ups.

✔️ **Extendable Python Architecture**
Clear modules and components for easy enhancement or integration.

---

## 🛠️ Architecture & Components

The repository includes the following key directories:

```
byu-hackathon/
├── app/                      # Main application code
├── components/               # UI or agent modules
├── scripts/                  # Data processing and training scripts
├── tests/                    # Unit and integration tests
├── .env.example              # Environment variable template
├── README.md                 # This file
├── IMPLEMENTATION_GUIDE.md   # Developer reference guide
```

---

## 📦 Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/Josh-Yamada16/byu-hackathon.git
   cd byu-hackathon
   ```

2. **Create and activate a Python environment**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in API keys or config values.

---

## ▶️ Running the Agent

To start the AI recommendation agent:

```bash
python app/main.py
```

Then follow the prompts to interact with the AI.

---

## 🧪 Tests

Run unit tests with:

```bash
pytest
```

---

## 📄 License

This project is released under the **MIT License**.

---

## 🏷️ Acknowledgements

Thanks to the **BYU REDO Hackathon community** and mentors for the opportunity to build creative student-centered solutions.
