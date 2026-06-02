from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Optional

class SiteTestResult(BaseModel):
    status: str = Field(..., description="Either 'online' or 'offline'")
    ping_ms: Optional[int] = Field(None, description="Latency in milliseconds, or null if offline")

class TestReportCreate(BaseModel):
    results: Dict[str, SiteTestResult]

class TestReportResponse(BaseModel):
    id: int
    timestamp: datetime
    isp: str
    city: str
    region: str
    country: str
    results: Dict[str, Dict]

    class Config:
        from_attributes = True

class SiteStats(BaseModel):
    online_count: int
    offline_count: int
    avg_ping: Optional[float] = None
    success_rate: float

class ISPStats(BaseModel):
    isp: str
    total_tests: int
    sites: Dict[str, SiteStats]

class LiveDashboardStats(BaseModel):
    total_scans_24h: int
    unique_isps_count: int
    isp_rankings: Dict[str, Dict[str, SiteStats]]
