import os

workers = int(os.environ.get('GUNICORN_PROCESSES', '3'))
threads = int(os.environ.get('GUNICORN_THREADS', '1'))
worker_class = "uvicorn.workers.UvicornWorker"
bind = "0.0.0.0:8001"