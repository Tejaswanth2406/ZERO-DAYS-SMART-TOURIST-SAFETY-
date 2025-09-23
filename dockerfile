# Start from Python 3.11
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy all files from GitHub into the container
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port your app uses
EXPOSE 8000

# Run your Python app
CMD ["python", "app.py"]
