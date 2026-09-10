import logging
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import csv

logger = logging.getLogger(__name__)


class FileParseError(Exception):
    """Raised when file parsing fails."""
    pass


def parse_pdf(file_path: Path) -> str:
    """
    Parse PDF file and extract text.
    Requires pypdf or pdfplumber (optional dependency).
    Falls back to error message if not available.
    """
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except ImportError:
        logger.warning("pdfplumber not installed. Install with: pip install pdfplumber")
        return f"[PDF content from {file_path.name} - parser not available]"
    except Exception as e:
        raise FileParseError(f"Failed to parse PDF: {e}")


def parse_txt(file_path: Path) -> str:
    """Parse plain text file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except UnicodeDecodeError:
        # Try with different encoding
        with open(file_path, "r", encoding="latin-1") as f:
            return f.read()
    except Exception as e:
        raise FileParseError(f"Failed to parse TXT: {e}")


def parse_csv(file_path: Path) -> str:
    """Parse CSV file and return as formatted text."""
    try:
        rows = []
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)

        # Format as readable text
        if not rows:
            return ""

        text = f"CSV Data: {file_path.name}\n"
        text += "=" * 60 + "\n"

        for i, row in enumerate(rows[:100]):  # Limit to first 100 rows
            text += f"Record {i + 1}:\n"
            for key, value in row.items():
                text += f"  {key}: {value}\n"
            text += "\n"

        if len(rows) > 100:
            text += f"... and {len(rows) - 100} more records\n"

        return text
    except Exception as e:
        raise FileParseError(f"Failed to parse CSV: {e}")


def parse_json(file_path: Path) -> str:
    """Parse JSON file and return as formatted text."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Convert to formatted string
        return json.dumps(data, indent=2)
    except json.JSONDecodeError as e:
        raise FileParseError(f"Invalid JSON: {e}")
    except Exception as e:
        raise FileParseError(f"Failed to parse JSON: {e}")


def parse_file(file_path: Path, file_type: str) -> str:
    """
    Parse file based on type and return full text content.

    Args:
        file_path: Path to file
        file_type: One of 'pdf', 'txt', 'csv', 'json'

    Returns:
        Extracted text content
    """
    if not file_path.exists():
        raise FileParseError(f"File not found: {file_path}")

    file_type = file_type.lower()

    if file_type == "pdf":
        return parse_pdf(file_path)
    elif file_type == "txt":
        return parse_txt(file_path)
    elif file_type == "csv":
        return parse_csv(file_path)
    elif file_type == "json":
        return parse_json(file_path)
    else:
        raise FileParseError(f"Unsupported file type: {file_type}")
