## Display Science Agents

- `git clone git@github.com:ProfNuru/phi_agents.git`
- `cd phi_agents`

#### Build and run docker container
- `cd agents_api`
- `docker compose up --build`

#### Run the frontend
- `cd ../agents_frontend`
- `npm install`
- Create .env file and add environment variables
- `npm run dev`
- Open the application at http://localhost:3000

.env
BASE_API_ROUTE="http://localhost:8000/api/v1"
SECRET_KEY = "bd9a0e81d7cadf2140e163e2f895fcb004ef7a2991ecd40a2cf64f4860137edb"
ALGORITHM = "HS256"
