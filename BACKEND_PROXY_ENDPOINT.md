# Backend TrakIntel Endpoints Implementation Guide

## Overview

The frontend's TrakIntel Configuration page requires several backend endpoints for configuration management and testing TrakIntel API endpoints without encountering CORS issues.

## Endpoint Status

### ✅ Already Implemented (Confirmed in Backend)

1. **`GET /api/trakintel/config`** - Get saved TrakIntel configuration
2. **`POST /api/trakintel/config`** - Save TrakIntel configuration
3. **`POST /api/trakintel/test-connection`** - Test connection to TrakIntel server
4. **`POST /api/trakintel/workbench`** - Get workbench data
5. **`POST /api/trakintel/highlights`** - Generate release highlights
6. **`GET /api/trakintel/lookups/{key}`** - Get lookup data

### ❌ Missing (Needs Implementation)

**Test Endpoint Proxy:** `POST /api/trakintel/test-endpoint`

**Purpose:** Acts as a proxy to forward test requests to the TrakIntel server, avoiding CORS restrictions when testing directly from the browser.

## Request Format

```json
{
  "method": "GET" | "POST" | "PUT" | "DELETE",
  "path": "/forms/organisations",
  "body": {
    // Optional: only for POST/PUT requests
  }
}
```

## Implementation Example (Python/FastAPI)

```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import httpx
from .auth import get_current_user, get_user_trakintel_config  # Your auth functions
from .database import db  # Your database connection

router = APIRouter()

# Models
class TrakintelConfigRequest(BaseModel):
    trakintel_url: str
    trakintel_token: str

class TestEndpointRequest(BaseModel):
    method: str  # GET, POST, PUT, DELETE
    path: str    # e.g., "/forms/organisations"
    body: Optional[Dict[str, Any]] = None


# 1. Get Configuration
@router.get("/api/trakintel/config")
async def get_trakintel_config(current_user = Depends(get_current_user)):
    """Get saved TrakIntel configuration for current user"""
    try:
        config = db.get_user_config(current_user.id, "trakintel")
        if not config:
            return {"trakintel_url": "", "trakintel_token": ""}
        return {
            "trakintel_url": config.get("trakintel_url", ""),
            "trakintel_token": config.get("trakintel_token", "")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2. Save Configuration
@router.post("/api/trakintel/config")
async def save_trakintel_config(
    request: TrakintelConfigRequest,
    current_user = Depends(get_current_user)
):
    """Save TrakIntel configuration for current user"""
    try:
        db.save_user_config(
            current_user.id,
            "trakintel",
            {
                "trakintel_url": request.trakintel_url,
                "trakintel_token": request.trakintel_token
            }
        )
        return {"message": "Configuration saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 3. Test Connection
@router.post("/api/trakintel/test-connection")
async def test_trakintel_connection(
    request: TrakintelConfigRequest,
    current_user = Depends(get_current_user)
):
    """Test connection to TrakIntel server"""
    try:
        # Test with a simple endpoint like /auth/userinfo
        headers = {
            "Authorization": f"Bearer {request.trakintel_token}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{request.trakintel_url}/auth/userinfo",
                headers=headers
            )
            response.raise_for_status()

        return {
            "message": "Connection successful",
            "status": "connected"
        }

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 401:
            raise HTTPException(
                status_code=400,
                detail="Invalid TrakIntel token"
            )
        raise HTTPException(
            status_code=400,
            detail=f"TrakIntel API error: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to connect to TrakIntel server: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# 4. Test Endpoint Proxy
@router.post("/api/trakintel/test-endpoint")
async def test_trakintel_endpoint(
    request: TestEndpointRequest,
    config = Depends(get_trakintel_config)
):
    """
    Proxy endpoint to test TrakIntel API calls from frontend.
    Avoids CORS issues by making the request from backend.
    """
    try:
        # Get TrakIntel configuration
        trakintel_url = config.get("trakintel_url")
        trakintel_token = config.get("trakintel_token")

        if not trakintel_url or not trakintel_token:
            raise HTTPException(
                status_code=400,
                detail="TrakIntel not configured. Please configure URL and token first."
            )

        # Build full URL
        full_url = f"{trakintel_url}{request.path}"

        # Prepare headers
        headers = {
            "Authorization": f"Bearer {trakintel_token}",
            "Content-Type": "application/json"
        }

        # Make the request to TrakIntel
        async with httpx.AsyncClient(timeout=30.0) as client:
            if request.method == "GET":
                response = await client.get(full_url, headers=headers)
            elif request.method == "POST":
                response = await client.post(
                    full_url,
                    headers=headers,
                    json=request.body or {}
                )
            elif request.method == "PUT":
                response = await client.put(
                    full_url,
                    headers=headers,
                    json=request.body or {}
                )
            elif request.method == "DELETE":
                response = await client.delete(full_url, headers=headers)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported HTTP method: {request.method}"
                )

        # Return the response from TrakIntel
        try:
            return response.json()
        except:
            return {"response": response.text, "status": response.status_code}

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"TrakIntel API error: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to connect to TrakIntel: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
```

## Implementation Example (Python/Flask)

```python
from flask import Blueprint, request, jsonify
import requests
from .auth import get_trakintel_config  # Your config retrieval function

bp = Blueprint('trakintel_proxy', __name__)

@bp.route('/api/trakintel/test-endpoint', methods=['POST'])
def test_trakintel_endpoint():
    """
    Proxy endpoint to test TrakIntel API calls from frontend.
    Avoids CORS issues by making the request from backend.
    """
    try:
        data = request.get_json()
        method = data.get('method')
        path = data.get('path')
        body = data.get('body')

        # Get TrakIntel configuration
        config = get_trakintel_config()
        trakintel_url = config.get('trakintel_url')
        trakintel_token = config.get('trakintel_token')

        if not trakintel_url or not trakintel_token:
            return jsonify({
                'error': 'TrakIntel not configured. Please configure URL and token first.'
            }), 400

        # Build full URL
        full_url = f"{trakintel_url}{path}"

        # Prepare headers
        headers = {
            'Authorization': f'Bearer {trakintel_token}',
            'Content-Type': 'application/json'
        }

        # Make the request to TrakIntel
        if method == 'GET':
            response = requests.get(full_url, headers=headers, timeout=30)
        elif method == 'POST':
            response = requests.post(full_url, headers=headers, json=body or {}, timeout=30)
        elif method == 'PUT':
            response = requests.put(full_url, headers=headers, json=body or {}, timeout=30)
        elif method == 'DELETE':
            response = requests.delete(full_url, headers=headers, timeout=30)
        else:
            return jsonify({'error': f'Unsupported HTTP method: {method}'}), 400

        # Return the response from TrakIntel
        try:
            return jsonify(response.json()), response.status_code
        except:
            return jsonify({'response': response.text, 'status': response.status_code}), response.status_code

    except requests.RequestException as e:
        return jsonify({
            'error': f'Unable to connect to TrakIntel: {str(e)}'
        }), 503
    except Exception as e:
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500
```

## Security Considerations

1. **Authentication Required**: Ensure this endpoint requires user authentication
2. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
3. **Validation**: Validate the path parameter to prevent SSRF attacks
4. **Logging**: Log all proxy requests for audit purposes
5. **Timeout**: Set reasonable timeouts (30 seconds recommended)

## Error Handling

The endpoint should handle these error cases:

1. **400 Bad Request**: Invalid method or missing configuration
2. **401 Unauthorized**: Invalid or missing TrakIntel token
3. **403 Forbidden**: TrakIntel denies access
4. **404 Not Found**: TrakIntel endpoint doesn't exist
5. **503 Service Unavailable**: Cannot connect to TrakIntel server
6. **500 Internal Server Error**: Unexpected errors

## Testing

Once implemented, you can test the endpoint using:

```bash
curl -X POST http://localhost:8000/api/trakintel/test-endpoint \
  -H "Content-Type: application/json" \
  -H "X-User-ID: your-user-id" \
  -d '{
    "method": "GET",
    "path": "/forms/organisations"
  }'
```

## Frontend Integration

The frontend already implements this endpoint at:
- **File**: `src/app/features/trakintel-config/components/trakintel-config.component.ts`
- **Line**: 325
- **Method**: `executeTest(endpoint: any)`

No frontend changes are needed once the backend endpoint is implemented.
