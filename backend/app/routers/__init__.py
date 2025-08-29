from .courses import router as courses_router
from .users import router as users_router
from .alerts import router as alerts_router
from .sync import router as sync_router
from .realtime import router as realtime_router

__all__ = ["courses_router", "users_router", "alerts_router", "sync_router", "realtime_router"]