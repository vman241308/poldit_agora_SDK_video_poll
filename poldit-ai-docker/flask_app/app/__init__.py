from flask import Flask
from celery import Celery
from flask_cors import CORS
from app.routes import tag_bp, answers_bp
import os

app_port = os.environ['APP_PORT']
# broker_url = os.environ['CLOUDAMQP_URL']
app_env = os.environ['APP_ENV']


def create_app():

    app = Flask(__name__)
    app.register_blueprint(tag_bp)
    app.register_blueprint(answers_bp)

    app.config.from_prefixed_env()
    app.config['TEMPLATES_AUTO_RELOAD'] = True

    if app_env == 'development':
        allowed_origins = ['http://localhost:3005',
                           "http://192.168.1.151:3005"]
        
        broker_url = os.environ['CLOUDAMQP_URL_DEV']
    else:
        allowed_origins = [
            "https://poldit.com",
            "https://api1.poldit.com",
            "https://www.poldit.com",
        ]
        broker_url = os.environ['CLOUDAMQP_URL']

    # Allow CORS
    CORS(app, resources={r"/*": {"origins": allowed_origins}})

    # Create a Celery instance with the same broker URL
    app.celery = Celery('tasks', broker=broker_url, backend='rpc://')

    return app
