import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List

from fastapi import FastAPI, Depends, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import settings
from .database import engine, Base, get_db
from .models import TestReport
from .schemas import TestReportCreate, TestReportResponse, LiveDashboardStats
from .utils import get_ip_details, hash_ip, get_redis_client, normalize_isp_name

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NetVibe API",
    description="Crowdsourced Real-time Internet Outage Monitoring API for Iran",
    version="1.0.0"
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_client_ip(request: Request) -> str:
    """Helper to extract real client IP considering Nginx reverse proxy"""
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        # Get the first IP in case of multiple proxies
        return x_forwarded_for.split(",")[0].strip()
    x_real_ip = request.headers.get("X-Real-IP")
    if x_real_ip:
        return x_real_ip.strip()
    return request.client.host if request.client else "127.0.0.1"

@app.get("/api/v1/ip-info")
async def get_ip_info(request: Request):
    """
    Detects user's public IP and queries its details (ISP, City, ASN, etc.)
    """
    client_ip = get_client_ip(request)
    # For local debugging
    if client_ip in ("127.0.0.1", "localhost", "::1", "backend_api", "nginx_proxy"):
        # Use a real Iranian IP for testing locally, e.g. a Pishgaman IP
        client_ip = "185.129.190.56"
        
    details = await get_ip_details(client_ip)
    # Clean up raw ISP name for nicer frontend rendering
    details["normalized_isp"] = normalize_isp_name(details["isp"])
    return details

@app.post("/api/v1/submit-report", response_model=Dict[str, Any])
async def submit_report(
    report_data: TestReportCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Submit test results for multiple sites.
    Applies Redis-based rate limiting (10 minutes per IP).
    """
    client_ip = get_client_ip(request)
    if client_ip in ("127.0.0.1", "localhost", "::1", "backend_api", "nginx_proxy"):
        client_ip = "185.129.190.56"

    # Rate limiting check
    ip_hash = hash_ip(client_ip)
    redis = get_redis_client()
    if redis:
        rate_limit_key = f"rate_limit:{ip_hash}"
        if redis.exists(rate_limit_key):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="You have already submitted a report recently. Please wait 10 minutes."
            )

    # Fetch client ISP and location information
    ip_info = await get_ip_details(client_ip)
    normalized_isp = normalize_isp_name(ip_info["isp"])

    # Prepare report results
    results_dict = {}
    for site, item in report_data.results.items():
        results_dict[site] = {
            "status": item.status,
            "ping_ms": item.ping_ms
        }

    # Store in database
    db_report = TestReport(
        ip_hash=ip_hash,
        isp=normalized_isp,
        asn=ip_info.get("asn"),
        city=ip_info.get("city"),
        region=ip_info.get("region"),
        country=ip_info.get("country"),
        country_code=ip_info.get("country_code"),
        latitude=ip_info.get("latitude"),
        longitude=ip_info.get("longitude"),
        hosting=ip_info.get("hosting", False),
        proxy=ip_info.get("proxy", False),
        results=results_dict
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Set rate limit key in Redis
    if redis:
        try:
            redis.setex(f"rate_limit:{ip_hash}", settings.SUBMISSION_RATE_LIMIT, "1")
            # Invalidate cached stats so the next page load gets updated info
            redis.delete("dashboard_stats_cache")
        except Exception as e:
            logger.error(f"Failed to interact with Redis: {e}")

    return {
        "success": True,
        "message": "Report submitted successfully.",
        "report_id": db_report.id,
        "isp": normalized_isp
    }

@app.get("/api/v1/dashboard-stats", response_model=LiveDashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Fetch aggregated live monitoring dashboard statistics from the last 24 hours.
    Results are cached in Redis for 15 seconds to handle high concurrent traffic.
    """
    redis = get_redis_client()
    if redis:
        try:
            cached = redis.get("dashboard_stats_cache")
            if cached:
                return json.loads(cached)
        except Exception as e:
            logger.error(f"Error reading from Redis cache: {e}")

    # Calculate statistics from Postgres (last 24 hours)
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    reports = db.query(TestReport).filter(TestReport.timestamp >= time_threshold).all()

    total_scans = len(reports)
    
    # Structure of statistics mapping:
    # {
    #    "ISP Name": {
    #         "Site Name": {
    #             "online_count": int,
    #             "offline_count": int,
    #             "pings": list of int,
    #         }
    #    }
    # }
    raw_stats: Dict[str, Dict[str, Dict[str, Any]]] = {}
    isps_seen = set()

    for r in reports:
        isp_name = r.isp or "Other ISP"
        isps_seen.add(isp_name)
        
        if isp_name not in raw_stats:
            raw_stats[isp_name] = {}
            
        for site, res in r.results.items():
            if site not in raw_stats[isp_name]:
                raw_stats[isp_name][site] = {
                    "online_count": 0,
                    "offline_count": 0,
                    "pings": []
                }
            
            status_str = res.get("status", "offline")
            ping_ms = res.get("ping_ms")
            
            if status_str == "online":
                raw_stats[isp_name][site]["online_count"] += 1
                if ping_ms is not None:
                    raw_stats[isp_name][site]["pings"].append(ping_ms)
            else:
                raw_stats[isp_name][site]["offline_count"] += 1

    # Format the aggregated stats for the response
    isp_rankings: Dict[str, Dict[str, Any]] = {}
    for isp, sites_data in raw_stats.items():
        isp_rankings[isp] = {}
        for site, metrics in sites_data.items():
            online = metrics["online_count"]
            offline = metrics["offline_count"]
            total = online + offline
            success_rate = round(online / total, 2) if total > 0 else 0.0
            
            pings = metrics["pings"]
            avg_ping = round(sum(pings) / len(pings), 1) if pings else None
            
            isp_rankings[isp][site] = {
                "online_count": online,
                "offline_count": offline,
                "avg_ping": avg_ping,
                "success_rate": success_rate
            }

    # If there are no scans in database, provide safe default empty or sample structure
    if total_scans == 0:
        isp_rankings = {
            "Hamrah-e-Aval (MCI)": {},
            "Irancell": {},
            "Shatel": {},
            "Mokhaberat": {},
            "Mobinnet": {}
        }

    response_data = {
        "total_scans_24h": total_scans,
        "unique_isps_count": len(isps_seen) if isps_seen else 0,
        "isp_rankings": isp_rankings
    }

    # Save to Redis with 15 seconds expiration
    if redis:
        try:
            redis.setex("dashboard_stats_cache", 15, json.dumps(response_data))
        except Exception as e:
            logger.error(f"Error saving to Redis cache: {e}")

    return response_data
