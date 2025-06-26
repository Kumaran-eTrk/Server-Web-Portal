# Use the official Python 3.12.1 image as base
FROM python:3.12.1

# Set the working directory inside the container to /app
WORKDIR /app

# Copy the requirements.txt file from your host to the container's /app directory
COPY requirements.txt ./

# Install Python dependencies listed in requirements.txt
RUN pip install -r requirements.txt

# Copy all files from your host to the container's /app directory
COPY . /app

# Expose port 9011 to allow communication to the Flask app
EXPOSE 9011

# Define the command to run the Flask app when the container starts
CMD [ "python", "main.py" ]
