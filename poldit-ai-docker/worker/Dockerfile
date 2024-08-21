# Flask app container
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /worker

# Install FFMPEG for video editing
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add a new user that we will use to run our application and give him sudo no password access
RUN useradd -m poldit_worker && echo "poldit_worker:poldit_worker" | chpasswd && adduser poldit_worker sudo

# Allow passwordless sudo for the poldit_worker user
RUN echo 'poldit_worker ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Change ownership of the /app directory to the poldit_worker user
RUN chown -R poldit_worker:poldit_worker /worker

# Copy over all requirements for each folder
COPY --chown=poldit_worker:poldit_worker ./shared/requirements.txt /worker/requirements_shared.txt

USER root
RUN pip install --no-cache-dir -r requirements_shared.txt

#Copy folders from local project to container
COPY --chown=poldit_worker:poldit_worker ./worker /worker
COPY --chown=poldit_worker:poldit_worker ./shared /worker/shared

RUN pip install --no-cache-dir -r requirements.txt

# Switch to our newly created user
USER poldit_worker

# Set the PYTHONPATH environment variable
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH=/worker


# # Switch to our newly created user
# USER poldit_worker

# # Copy over all requirements for each folder
# COPY ./shared/requirements.txt requirements_shared.txt
# COPY ./worker/requirements.txt requirements_worker.txt

# # Concatenate requirements.txt files into a single file and install requirements
# RUN cat requirements_shared.txt requirements_worker.txt > requirements.txt
# RUN rm -rf requirements_shared.txt
# RUN rm -rf requirements_worker.txt
# # COPY ./shared/requirements.txt ./worker/requirements.txt 
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the project files to the working directory
# COPY ./shared ./shared
# COPY ./worker .

# # Set the PYTHONPATH environment variable
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1
# ENV PYTHONPATH=/





# # Install the project dependencies
# RUN pip install --no-cache-dir -r requirements.txt && \
#     pip install --no-cache-dir -r /shared/requirements.txt

# Start the Celery worker
CMD ["celery", "-A", "config.celery", "worker", "--loglevel=info", "-P", "eventlet", "-c", "4", "-E"]