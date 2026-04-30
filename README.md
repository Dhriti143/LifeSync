# RUMI

RUMI is a full-stack personal management system designed to track daily productivity, mental well-being, and long-term aspirations. Built with a decoupled architecture using a Python-based FastAPI backend and a React-based frontend, it demonstrates modern engineering practices including asynchronous processing, relational data modeling, and secure authentication.

## Core Features

- **Personal Journaling**: A daily log system for reflection with planned sentiment analysis integration.
- **Habit Tracking**: A persistent tracker with streak logic and completion history.
- **Goal Management**: A hierarchical goal-setting system with progress calculation and sub-task tracking.
- **Dashboard Analytics**: Visual representation of mood trends and habit consistency.
- **Daily Inspiration**: Integration with external APIs to provide daily motivational context.

## Technical Stack

### Backend
- **Language**: Python 3.12+
- **Framework**: FastAPI (Asynchronous API)
- **Database**: PostgreSQL
- **ORM**: SQLModel (pydantic-based SQLAlchemy wrapper)
- **Security**: JWT (JSON Web Tokens) with OAuth2 Password Bearer flow
- **Migration Tool**: Alembic

### Frontend
- **Library**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **State Management**: React Hooks and Context API
- **Data Visualization**: Recharts

## Architecture Overview

The project follows a modular "Clean Architecture" approach:
- **API Layer**: Handles HTTP requests and response validation via Pydantic schemas.
- **Service Layer**: Contains business logic, such as streak calculations and progress algorithms.
- **Data Layer**: Manages persistence and relational integrity via PostgreSQL.
- **Authentication**: Implements secure password hashing using Passlib (Bcrypt) and stateless session management via JWT.

## Installation and Setup

### Prerequisites
- Python 3.12 or higher
- Node.js 18 or higher
- PostgreSQL instance

### Backend Setup
1. Navigate to the backend directory:
   `cd backend`
2. Create and activate a virtual environment:
   `python -m venv venv`
3. Install dependencies:
   `pip install -r requirements.txt`
4. Configure the `.env` file with your `DATABASE_URL` and `SECRET_KEY`.
5. Run database migrations:
   `alembic upgrade head`
6. Start the server:
   `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to the frontend directory:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Start the development server:
   `npm run dev`

## Development Roadmap

- **Phase 1**: Authentication system and database infrastructure. (Completed)
- **Phase 2**: Journaling and Quote API integration.
- **Phase 3**: Mood tracking and Habit streak logic.
- **Phase 4**: Goal management and progress visualization.
- **Phase 5**: Advanced analytics dashboard.
- **Phase 6**: AI-driven insights and PWA support.

## License
Distributed under the MIT License.