# Natural Language to SQL Converter

A hackathon project that converts natural language questions into SQL queries using AI.

## Features

- Convert English questions to SQL queries
- React frontend with a clean UI
- FastAPI backend with HuggingFace integration
- Docker support for easy setup and deployment

## Project Structure

```
├── frontend/            # React frontend
├── backend/             # FastAPI backend
├── docker-compose.yml   # Docker Compose configuration
└── README.md            # This file
```

## For Team Members: Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/NLtoSQL.git
cd NLtoSQL
```

### Step 2: Set Up Your Environment

#### Prerequisites
- Docker and Docker Compose installed ([Get Docker](https://docs.docker.com/get-docker/))
- Git installed ([Get Git](https://git-scm.com/downloads))
- HuggingFace account (free) for API token

#### Get a HuggingFace Token
1. Sign up or log in at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens → New token (Read)
3. Copy your token

### Step 3: Configure and Run

1. Edit the `docker-compose.yml` file:
   ```yaml
   # Find this section
   environment:
     - HUGGINGFACE_API_TOKEN=hf_dummy_token
   
   # Replace hf_dummy_token with your actual token
   ```

2. Build and run with Docker:
   ```bash
   docker-compose up --build
   ```

3. Access the app:
   - Frontend: http://localhost:3000
   - Backend API docs: http://localhost:8000/docs

### Step 4: Test the Application

Try example questions like:
- "Find all customers who joined after January 2023"
- "What's the total sales for each product category?"
- "List the top 5 customers by order amount"

## Contributing to the Project

### Making Changes

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

4. Push to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request on GitHub

### Development Without Docker

If you prefer to develop without Docker, follow these instructions:

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set your HuggingFace API token:
   ```bash
   # On Windows
   set HUGGINGFACE_API_TOKEN=your_token_here
   # On macOS/Linux
   export HUGGINGFACE_API_TOKEN=your_token_here
   ```

5. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm start
   ```

4. Access the frontend at http://localhost:3000

## Customizing the Database Schema

To customize the database schema, edit the `schema` variable in `backend/main.py`.

## Troubleshooting

### Common Issues

1. **Docker container fails to start**
   - Make sure ports 3000 and 8000 are not in use
   - Check Docker logs: `docker-compose logs`

2. **API calls failing**
   - Verify your HuggingFace token is correct
   - Check if you've exceeded the free API limits

3. **Changes not reflecting**
   - Rebuild the containers: `docker-compose up --build`

## License

MIT 