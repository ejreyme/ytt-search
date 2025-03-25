# Use a lightweight Python image
#FROM python:3.9-slim
FROM python:3.9-slim-bullseye

# Install curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Set the working directory
WORKDIR /app

# Copy only `requirements.txt` for caching
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app

# Expose the Flask app port
EXPOSE 9003

# Run the app with Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:9003", "app:app"]