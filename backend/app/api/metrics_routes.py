from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from prometheus_client import CollectorRegistry, Counter, Histogram, Gauge, generate_latest
import time

router = APIRouter(tags=["observability"])

# Create a custom registry for L.I.G.H.T
REGISTRY = CollectorRegistry()

# -----------------
# Define Metrics
# -----------------

# API Latency
REQUEST_LATENCY = Histogram(
    'light_request_latency_seconds',
    'Latency of API requests in seconds',
    ['endpoint'],
    registry=REGISTRY
)

# Vector DB
VECTOR_QUERY_LATENCY = Histogram(
    'light_vector_query_latency_seconds',
    'Latency of ChromaDB retrieval queries',
    registry=REGISTRY
)

# Queues and Workers
OCR_QUEUE_BACKLOG = Gauge(
    'light_ocr_queue_size',
    'Number of items waiting in the PaddleOCR Celery queue',
    registry=REGISTRY
)

# Agent Triggers
ESCALATION_COUNT = Counter(
    'light_hitl_escalation_total',
    'Total number of queries routed to HITL Escalation Queue',
    registry=REGISTRY
)

ERROR_RATE = Counter(
    'light_error_total',
    'Total number of raised backend exceptions',
    registry=REGISTRY
)

CIRCUIT_BREAKER_TRIPS = Counter(
    'light_circuit_breaker_trips_total',
    'Total number of times a service circuit breaker tripped OPEN',
    registry=REGISTRY
)

@router.get("/metrics")
def metrics():
    """
    Prometheus-compatible metrics endpoint.
    Returns OpenMetrics plain text format.
    """
    return PlainTextResponse(generate_latest(REGISTRY))
