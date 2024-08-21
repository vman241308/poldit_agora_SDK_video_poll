from tasks import classify, answer, video_stream
from celery import Celery
import os
import logging

app_env = 'production'
# app_env = os.environ['APP_ENV']

log_format = (
    '[%(asctime)s] %(levelname)s in %(module)s: '
    'Function: %(funcName)s Line: %(lineno)d - '
    '%(message)s'
)

logging.basicConfig(level=logging.INFO, format=log_format)

# Configure Celery's logger
celery_logger = logging.getLogger('celery')
celery_logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter(log_format))
celery_logger.addHandler(handler)


def create_celery_app():

    if app_env == 'production':
        broker_url = 'amqps://usqyfuku:9FM9VjUkQQgNZF0XqHzf7P7hf92itB0i@moose.rmq.cloudamqp.com/usqyfuku'
        # broker_url = os.environ['CLOUDAMQP_URL']
    else:
        broker_url = os.environ['CLOUDAMQP_URL_DEV']

    celery = Celery('tasks', broker=broker_url, backend='rpc://')
    celery.conf.broker_connection_retry_on_startup = True
    celery.conf.broker_connection_max_retries = 5  # max retries
    celery.conf.broker_heartbeat = 10  # set heartbeat
    celery.conf.broker_connection_retry = True  # enable connection retry
    celery.conf.task_acks_late = True

    # celery.conf.update({
    #     'BROKER_CONNECTION_RETRY_ON_STARTUP': True
    #     'BROKER_HEARTBEAT': 10,  # set heartbeat
    #     'BROKER_CONNECTION_RETRY': True,  # enable connection retry
    #     'BROKER_CONNECTION_MAX_RETRIES': 5,  # max retries
    # })

    return celery


celery = create_celery_app()
