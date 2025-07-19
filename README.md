# NL2SQL AI: Natural Language to SQL Converter

A powerful AI-powered tool that converts natural language questions into SQL queries for data analysis, built for the hackathon.

![NL2SQL AI](frontend/public/logo192.png)

## 🌟 Key Features

- **Natural Language to SQL Conversion**: Ask questions in plain English and get optimized SQL queries
- **Step-by-Step Reasoning**: See how the AI breaks down your question into logical steps to construct SQL
- **Query Execution**: Execute generated queries against sample databases to verify results
- **Automatic Visualization**: Get instant data visualizations to better understand relationships in your data
- **Multiple Database Schema Support**: Choose from different pre-configured schemas or add your own
- **Query History**: Track and reuse previous queries and their results
- **Dark/Light Mode**: Choose your preferred theme for the interface

## 🚀 Demo Tips (For Hackathon Presentation)

1. **Start with the Problem Statement**: "Not everyone knows how to query databases or write scripts, which limits access to insights."

2. **Live Demo Flow**:
   - Show selecting a schema (HR, Library, etc.)
   - Ask a simple question: "Show me all employees in the IT department"
   - Point out the reasoning steps tab to show how the AI thinks
   - Execute the query and show the results
   - Demonstrate the automatic visualization feature
   - Try a more complex question: "What's the average salary by department, sorted from highest to lowest?"
   - Show how query history lets you reuse past queries

3. **Key Technical Points to Highlight**:
   - Use of LLaMA 3 Coder 8B model for SQL generation
   - Step-by-step reasoning process (differentiator from other tools)
   - In-memory query execution for real-time feedback
   - Automatic data visualization capabilities
   - Responsive UI design that works across devices

4. **Industry Impact Points**:
   - Democratizes access to data insights for non-technical users
   - Reduces time to insight from hours/days to seconds
   - Serves as an educational tool for learning SQL
   - Eliminates the barrier between business users and data
   - Can be extended to connect to real-world databases

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Python, FastAPI, SQLite (in-memory)
- **AI Model**: LLaMA 3 Coder 8B via HuggingFace Inference API
- **Deployment**: Docker, Docker Compose

## 🏃‍♂️ Running the Project

### Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Create a `.env` file with your HuggingFace API token:
   ```
   HUGGINGFACE_API_TOKEN=your_token_here
   ```
3. Run the application:
   ```
   docker-compose up
   ```
4. Open your browser and navigate to http://localhost:3000

### Development Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## 📊 Judging Criteria Alignment

This project directly addresses the hackathon judging criteria:

1. **Problem Fit (20 pts)**
   - Directly addresses the core challenge of making database querying accessible
   - Real-world use case for business analytics, data exploration, and education

2. **Technical Execution (20 pts)**
   - Robust architecture with separation of concerns
   - Effective use of LLaMA 3 AI model for SQL generation
   - Clean implementation with responsive design

3. **Creativity (20 pts)**
   - Original approach with step-by-step reasoning
   - Novel combination of SQL generation, execution, and visualization
   - High cross-domain potential (works for any SQL database schema)

4. **Advanced Features (15 pts)**
   - Step-by-step reasoning visualization
   - Query execution against in-memory database
   - Automatic data visualization
   - Schema inference capabilities

5. **Demo Clarity & Audience Engagement (25 pts)**
   - Clear UI with intuitive workflow
   - Impressive "wow" moments with complex queries
   - Educational component showing SQL learning

## 🔮 Future Enhancements

- **Database Connection**: Connect to real databases (MySQL, PostgreSQL, etc.)
- **Schema Inference**: Automatically analyze database structure without manual schema definition
- **Advanced Visualizations**: More chart types and customization options
- **SQL Optimization**: Analyze and optimize generated queries for better performance
- **Conversational Follow-ups**: Ask follow-up questions that reference previous results

## 📝 License

MIT 