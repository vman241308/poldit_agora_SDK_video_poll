# Flask app container
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Add a new user that we will use to run our application and give him sudo no password access
RUN useradd -m poldit_worker && echo "poldit_worker:poldit_worker" | chpasswd && adduser poldit_worker sudo

# Allow passwordless sudo for the poldit_worker user
RUN echo 'poldit_worker ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Change ownership of the /app directory to the poldit_worker user
RUN chown -R poldit_worker:poldit_worker /app

# Copy over all requirements for each folder
COPY --chown=poldit_worker:poldit_worker ./shared/requirements.txt /app/requirements_shared.txt

USER root
RUN pip install --no-cache-dir -r requirements_shared.txt

#Copy folders from local project to container
COPY --chown=poldit_worker:poldit_worker ./flask_app /app
COPY --chown=poldit_worker:poldit_worker ./shared /app/shared

RUN pip install --no-cache-dir -r requirements.txt

# Switch to our newly created user
USER poldit_worker

# Set the PYTHONPATH environment variable
ENV PYTHONPATH=/app

# Expose the port on which the Flask app will run
EXPOSE 5001

# Start the Flask app
CMD ["gunicorn", "-b", ":5000", "-k", "gevent", "-w", "3", "main:flask_app"]