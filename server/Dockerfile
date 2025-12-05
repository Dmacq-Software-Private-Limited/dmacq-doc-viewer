FROM python:3.11-slim

# Install system dependencies required by your app + pycairo
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libreoffice \
    poppler-utils \
    imagemagick \
    libmagic1 \
    build-essential \
    libcairo2 \
    libcairo2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for Docker caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads converted thumbnails

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
