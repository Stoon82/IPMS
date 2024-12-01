from .auth import router
from .tasks import router as tasks_router
from .activities import router as activities_router
from .development import router as development_router
from .profile import router as profile_router
from .projects import router as projects_router

__all__ = ['router', 'tasks_router', 'activities_router', 'development_router', 'profile_router', 'projects_router']
