"""
Pile Capacity Calculator – FastAPI Backend
==========================================

Engineering Methods Used
-------------------------
• Clay shaft friction  : α-method  →  qs = α × Cu
• Sand shaft friction  : Effective stress method
    - L/D < 15  : Average overburden = (ovTop + ovBottom) / 2
                  qs = K × σ'v_avg × tan(δ)   where δ = φ (conservative)
    - L/D >= 15 : Compute σ'v from bulk/submerged unit weights
                  same formula applies
• Clay end bearing    : Skempton  →  Qp = 9 × Cu × Ap
• Sand end bearing    : Qp = σ'v × Nq × Ap
• Pile perimeter      : C = π × D
• Pile tip area       : Ap = π × D² / 4
• Ultimate capacity   : Qu = ΣQs + Qp
• Allowable capacity  : Qa = Qu / FOS  (FOS = 2.5 by default)
"""

import math
from typing import List, Optional, Union, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator


# ─── Constants ───────────────────────────────────────────────────────────────

FACTOR_OF_SAFETY = 2.5
PI = math.pi


# ─── Pydantic Models ─────────────────────────────────────────────────────────

class ClayLayer(BaseModel):
    soilType: Literal["clay"]
    thickness: float = Field(..., gt=0, description="Layer thickness in metres")
    alpha: float = Field(..., ge=0, le=1, description="Adhesion factor α")
    cohesion: float = Field(..., gt=0, description="Average undrained cohesion Cu (kN/m²)")


class SandLayerLDLow(BaseModel):
    """Sand layer where L/D < 15 – user supplies overburden directly."""
    soilType: Literal["sand"]
    thickness: float = Field(..., gt=0)
    K: float = Field(..., gt=0, description="Lateral earth pressure coefficient")
    phi: float = Field(..., gt=0, lt=90, description="Interface friction angle δ in degrees")
    ovTop: float = Field(..., ge=0, description="Effective overburden at top (kN/m²)")
    ovBottom: float = Field(..., ge=0, description="Effective overburden at bottom (kN/m²)")


class SandLayerLDHigh(BaseModel):
    """Sand layer where L/D >= 15 – backend computes overburden from unit weights."""
    soilType: Literal["sand"]
    thickness: float = Field(..., gt=0)
    K: float = Field(..., gt=0)
    phi: float = Field(..., gt=0, lt=90)
    bulkUnit: float = Field(..., gt=0, description="Bulk unit weight above WT (kN/m³)")
    waterTableDepth: float = Field(..., ge=0, description="Water table depth from top of layer (m)")
    submergedUnit: float = Field(..., gt=0, description="Submerged unit weight below WT (kN/m³)")


class ClayTip(BaseModel):
    soilType: Literal["clay"]
    cohesion: float = Field(..., gt=0, description="Undrained cohesion at pile tip (kN/m²)")


class SandTip(BaseModel):
    soilType: Literal["sand"]
    overburden: float = Field(..., ge=0, description="Effective overburden at pile tip (kN/m²)")
    nq: float = Field(..., gt=0, description="Bearing capacity factor Nq")


# Use a generic dict for layer input so we can dispatch on soilType
class CalculateRequest(BaseModel):
    diameter: float = Field(..., gt=0, description="Pile diameter in metres")
    layers: List[dict] = Field(..., min_length=1)
    tip: dict


class LayerResult(BaseModel):
    layer: int              # 1-based layer number
    soilType: str
    thickness: float
    skinFrictionClay: float # Qs from clay α-method (0 if sand layer)
    skinFrictionSand: float # Qs from sand effective-stress (0 if clay layer)
    shaftResistance: float  # Total Qs = skinFrictionClay + skinFrictionSand


class CalculateResponse(BaseModel):
    layerResults: List[LayerResult]
    Qp: float   # End bearing (kN)
    Qu: float   # Ultimate capacity (kN)
    Qa: float   # Allowable capacity (kN)


# ─── Engineering Calculations ─────────────────────────────────────────────────

def pile_perimeter(diameter: float) -> float:
    """C = π × D"""
    return PI * diameter


def pile_tip_area(diameter: float) -> float:
    """Ap = π × D² / 4"""
    return PI * (diameter ** 2) / 4


def calc_clay_shaft(layer: ClayLayer, perimeter: float) -> float:
    """
    α-method:  Qs = α × Cu × C × L
    """
    return layer.alpha * layer.cohesion * perimeter * layer.thickness


def calc_sand_shaft_low(layer: SandLayerLDLow, perimeter: float) -> float:
    """
    Effective stress method (L/D < 15):
    σ'v_avg = (ovTop + ovBottom) / 2
    Qs = K × σ'v_avg × tan(δ) × C × L
    """
    sigma_avg = (layer.ovTop + layer.ovBottom) / 2.0
    delta_rad = math.radians(layer.phi)
    return layer.K * sigma_avg * math.tan(delta_rad) * perimeter * layer.thickness


def calc_sand_shaft_high(layer: SandLayerLDHigh, perimeter: float) -> float:
    """
    Effective stress method (L/D >= 15):
    Compute average effective overburden from unit weights.

    Overburden at top = 0 (relative to layer top; absolute stress
    must be tracked externally; here we compute the layer's own contribution).
    For the layer internally:
      - Dry portion depth = min(waterTableDepth, thickness)
      - Submerged portion depth = thickness − dry_depth
      σ'v_avg is computed as the average of σ'v at layer top (0) and layer bottom
    Qs = K × σ'v_avg × tan(δ) × C × L
    """
    dry_depth = min(layer.waterTableDepth, layer.thickness)
    wet_depth = layer.thickness - dry_depth

    # Stress at bottom of layer (relative to layer top as datum 0)
    sigma_bottom = layer.bulkUnit * dry_depth + layer.submergedUnit * wet_depth

    # Simple average (top = 0, bottom = sigma_bottom)
    sigma_avg = sigma_bottom / 2.0

    delta_rad = math.radians(layer.phi)
    return layer.K * sigma_avg * math.tan(delta_rad) * perimeter * layer.thickness


def calc_clay_tip(tip: ClayTip, area: float) -> float:
    """Skempton: Qp = 9 × Cu × Ap"""
    return 9.0 * tip.cohesion * area


def calc_sand_tip(tip: SandTip, area: float) -> float:
    """Qp = σ'v × Nq × Ap"""
    return tip.overburden * tip.nq * area


import os

from fastapi.openapi.docs import get_swagger_ui_html

# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Pile Capacity Calculator API",
    description="Computes shaft resistance, end bearing, ultimate and allowable pile capacity.",
    version="1.0.0",
    docs_url=None,   # Disable default docs to override with cdnjs
    redoc_url=None,  # Disable default redoc
)

# CORS configuration
origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in origins_env.split(",")
    if origin.strip()
]

if not allowed_origins:
    allowed_origins = [
        "http://localhost:5173",
        "https://pile-capacity-calculator.vercel.app"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup information logging
@app.on_event("startup")
def startup_event():
    backend_url = os.getenv("RENDER_EXTERNAL_URL", "http://localhost:8000")
    print("=" * 60)
    print("PILE CAPACITY API - STARTUP METADATA")
    print(f"Backend External URL: {backend_url}")
    print(f"Allowed CORS Origins: {allowed_origins}")
    print(f"Environment Config:   ALLOWED_ORIGINS={os.getenv('ALLOWED_ORIGINS')}")
    print("=" * 60)


@app.get("/", summary="Root endpoint")
def root():
    return {"status": "ok", "message": "Pile Capacity Calculator API is running."}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Pile Capacity API",
        "version": "1.0.0"
    }


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui-bundle.js",
        swagger_css_url="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui.css",
    )


@app.post("/calculate", response_model=CalculateResponse, summary="Calculate pile capacity")
def calculate(req: CalculateRequest):
    diameter = req.diameter
    perimeter = pile_perimeter(diameter)
    area = pile_tip_area(diameter)

    layer_results: List[LayerResult] = []
    total_qs = 0.0

    # ── Process each layer ───────────────────────────────────────────────────
    for i, raw in enumerate(req.layers):
        soil_type = raw.get("soilType", "")

        if soil_type == "clay":
            try:
                layer = ClayLayer(**raw)
            except Exception as e:
                raise HTTPException(status_code=422, detail=f"Layer {i+1} (Clay): {e}")
            qs = calc_clay_shaft(layer, perimeter)

        elif soil_type == "sand":
            thickness = raw.get("thickness", 0) or 0
            ld = float(thickness) / diameter

            if ld < 15:
                try:
                    layer = SandLayerLDLow(**raw)
                except Exception as e:
                    raise HTTPException(status_code=422, detail=f"Layer {i+1} (Sand L/D<15): {e}")
                qs = calc_sand_shaft_low(layer, perimeter)
            else:
                try:
                    layer = SandLayerLDHigh(**raw)
                except Exception as e:
                    raise HTTPException(status_code=422, detail=f"Layer {i+1} (Sand L/D≥15): {e}")
                qs = calc_sand_shaft_high(layer, perimeter)

        else:
            raise HTTPException(
                status_code=422,
                detail=f"Layer {i+1}: Unknown soilType '{soil_type}'. Must be 'clay' or 'sand'.",
            )

        qs = round(qs, 3)
        total_qs += qs

        # Separate clay and sand skin friction contributions
        skin_clay = qs if soil_type == "clay" else 0.0
        skin_sand = qs if soil_type == "sand" else 0.0

        layer_results.append(
            LayerResult(
                layer=i + 1,
                soilType=soil_type,
                thickness=float(raw.get("thickness", 0)),
                skinFrictionClay=skin_clay,
                skinFrictionSand=skin_sand,
                shaftResistance=qs,
            )
        )

    # ── Tip bearing ──────────────────────────────────────────────────────────
    tip_raw = req.tip
    tip_type = tip_raw.get("soilType", "")

    if tip_type == "clay":
        try:
            tip = ClayTip(**tip_raw)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Pile tip (Clay): {e}")
        qp = calc_clay_tip(tip, area)

    elif tip_type == "sand":
        try:
            tip = SandTip(**tip_raw)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Pile tip (Sand): {e}")
        qp = calc_sand_tip(tip, area)

    else:
        raise HTTPException(
            status_code=422,
            detail=f"Tip: Unknown soilType '{tip_type}'. Must be 'clay' or 'sand'.",
        )

    qp = round(qp, 3)
    qu = round(total_qs + qp, 3)
    qa = round(qu / FACTOR_OF_SAFETY, 3)

    return CalculateResponse(
        layerResults=layer_results,
        Qp=qp,
        Qu=qu,
        Qa=qa,
    )
