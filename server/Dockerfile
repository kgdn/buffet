FROM python:latest

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Mount /app/iso as a volume
VOLUME /app/iso

# Install qemu-system-x86_64
RUN apt-get update && apt-get install -y qemu-system-x86

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 8000 available to the world outside this container
EXPOSE 5700 5900 8000

# Run gunicorn
CMD ["gunicorn", "app:app"]