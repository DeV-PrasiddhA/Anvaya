from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings


router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: Literal["healthy"]
    service: str
    version: str
    environment: str


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Check backend health",
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service="anvaya-market-intelligence",
        version=settings.app_version,
        environment=settings.app_environment,
    )