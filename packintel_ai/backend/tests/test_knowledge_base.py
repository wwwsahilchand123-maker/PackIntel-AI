import pytest
from pathlib import Path
from io import BytesIO


@pytest.mark.asyncio
async def test_upload_txt_file(client, tmp_path):
    """Test uploading a TXT file."""
    txt_path = tmp_path / "test.txt"
    txt_path.write_text("This is a test document about packaging materials.")

    with open(txt_path, "rb") as f:
        response = await client.post(
            "/api/v1/knowledge-base/upload",
            files={"file": ("test.txt", f, "text/plain")},
            data={"description": "Test document"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "document_id" in data
    assert data["status"] in ("processing", "indexed")


@pytest.mark.asyncio
async def test_upload_invalid_file_type(client, tmp_path):
    """Test that invalid file types are rejected."""
    exe_path = tmp_path / "test.exe"
    exe_path.write_bytes(b"fake executable")

    with open(exe_path, "rb") as f:
        response = await client.post(
            "/api/v1/knowledge-base/upload",
            files={"file": ("test.exe", f, "application/x-msdownload")},
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_documents(client):
    """Test listing documents."""
    response = await client.get("/api/v1/knowledge-base/documents?page=1&limit=20")
    assert response.status_code == 200
    data = response.json()
    assert "documents" in data
    assert "total" in data
    assert isinstance(data["documents"], list)


@pytest.mark.asyncio
async def test_list_documents_filter_by_status(client):
    """Test filtering documents by status."""
    response = await client.get("/api/v1/knowledge-base/documents?status=indexed")
    assert response.status_code == 200
    data = response.json()
    for doc in data["documents"]:
        assert doc["status"] == "indexed"


@pytest.mark.asyncio
async def test_kb_status(client):
    """Test knowledge base status endpoint."""
    response = await client.get("/api/v1/knowledge-base/status")
    assert response.status_code == 200
    data = response.json()
    assert "total_documents" in data
    assert "total_chunks" in data
    assert "qdrant_healthy" in data
    assert isinstance(data["total_documents"], int)
    assert isinstance(data["total_chunks"], int)
    assert isinstance(data["qdrant_healthy"], bool)


@pytest.mark.asyncio
async def test_search_empty_kb(client):
    """Test searching with no documents."""
    response = await client.post(
        "/api/v1/knowledge-base/search",
        json={"query": "packaging", "top_k": 10},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "packaging"
    assert isinstance(data["results"], list)
