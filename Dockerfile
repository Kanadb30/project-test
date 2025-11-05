# Use official Python slim image (lightweight, Ubuntu base)
FROM python:3.13-slim

# Install system dependencies (GNUplot + basics for headless run)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gnuplot \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy requirements first (for pip caching)
COPY requirments.txt .

# Install Python deps
RUN pip install --no-cache-dir -r requirments.txt

# Copy app code
COPY . .

# Expose port (Render assigns dynamically, but good practice)
EXPOSE 10000

# Run the app
CMD ["python", "main.py"]