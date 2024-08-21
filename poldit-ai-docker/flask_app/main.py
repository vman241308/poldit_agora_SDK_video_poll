from app import create_app
import os
import sys

# Modify sys.path to include the project root directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

flask_app = create_app()

app_port = os.environ['APP_PORT']

if __name__ == '__main__':
    flask_app.run(host='0.0.0.0', port=app_port, debug=True)