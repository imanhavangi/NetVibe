from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, func
from .database import Base

class TestReport(Base):
    __tablename__ = "test_reports"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, server_default=func.now(), index=True)
    ip_hash = Column(String, index=True)
    isp = Column(String, index=True)
    asn = Column(String)
    city = Column(String)
    region = Column(String)
    country = Column(String)
    country_code = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    hosting = Column(Boolean, default=False)
    proxy = Column(Boolean, default=False)
    results = Column(JSON, nullable=False)
