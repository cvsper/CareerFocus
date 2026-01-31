from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.timesheets import router as timesheets_router
from app.api.programs import router as programs_router
from app.api.documents import router as documents_router
from app.api.opportunities import router as opportunities_router
from app.api.learning import router as learning_router
from app.api.dashboard import router as dashboard_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(timesheets_router)
api_router.include_router(programs_router)
api_router.include_router(documents_router)
api_router.include_router(opportunities_router)
api_router.include_router(learning_router)
api_router.include_router(dashboard_router)
