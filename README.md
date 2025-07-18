# Natural Language to SQL Converter

This project provides a web-based tool that converts natural language questions into SQL queries using the HuggingFace Inference API.

## Features

- Convert natural language questions to SQL queries
- Multiple model options for SQL generation
- React-based frontend with a clean UI
- FastAPI backend with HuggingFace integration

## Project Structure

```
.
├── backend/                 # FastAPI server
│   ├── main.py              # Main API code
│   ├── test_token.py        # Script to test HF models
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Docker config for backend
├── frontend/                # React frontend
│   ├── src/                 # React source code
│   ├── package.json         # JS dependencies
│   └── Dockerfile           # Docker config for frontend
└── docker-compose.yml       # Docker Compose configuration
```

## Available Models

The application supports multiple models for SQL generation through HuggingFace Inference API:

1. **defog/sqlcoder-7b-2** (default) - Specialized SQL generation model
2. **gaussalgo/T5-LM-Large-text2sql-spider** (small) - Lighter SQL model
3. **codellama/CodeLlama-7b-Instruct-hf** - Code generation model adapted for SQL
4. **budecosystem/sql-millennials-13b** - Large SQL generation model
5. **motherduckdb/DuckDB-NSQL-7B-v0.1** - DuckDB's SQL generation model

## Getting Started

### Prerequisites

- Docker and Docker Compose
- HuggingFace API token (get one at https://huggingface.co/settings/tokens)

### Running the Application

1. Clone the repository
2. Edit `docker-compose.yml` to add your HuggingFace API token:

```yaml
environment:
  - HUGGINGFACE_API_TOKEN=your_token_here  # Replace with your actual token
  - SELECTED_MODEL=default  # Options: default, small, codellama, sql_millennials, duckdb
```

3. Start the application:

```bash
docker-compose up --build
```

4. Open your browser and navigate to http://localhost:3000

### Testing the Models

You can test which models are available and working with your API token by running:

```bash
cd backend
export HUGGINGFACE_API_TOKEN=your_token_here
python test_token.py
```

This will attempt to generate SQL with each model and report which ones are working.

### Configuring Models

You can select which model to use by changing the `SELECTED_MODEL` environment variable in `docker-compose.yml`:

```yaml
environment:
  - SELECTED_MODEL=codellama  # Choose any of the available models
```

Available options:
- `default` (defog/sqlcoder-7b-2)
- `small` (gaussalgo/T5-LM-Large-text2sql-spider)
- `codellama` (codellama/CodeLlama-7b-Instruct-hf)
- `sql_millennials` (budecosystem/sql-millennials-13b)
- `duckdb` (motherduckdb/DuckDB-NSQL-7B-v0.1)

## API Endpoints

- `GET /` - API status check
- `GET /models` - List all available models and current selection
- `POST /generate_sql` - Generate SQL from natural language question

## License

This project is licensed under the MIT License. 