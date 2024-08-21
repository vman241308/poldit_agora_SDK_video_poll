from functools import wraps
from flask import request, jsonify
from jwt import decode, exceptions
from typing import Callable
import os

jwt_key = os.getenv('JWT_KEY')

def authenticate_user(f: Callable):
    @wraps(f)
    def decorator(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if auth_header:
            token = auth_header.split(' ')[1]
            try:
                decoded_token = decode(
                    token, key=jwt_key, algorithms=['HS256'])
            except exceptions.InvalidTokenError as e:
                return jsonify({'message': 'Invalid token'}), 403
        else:
            return jsonify({'message': 'No token provided'}), 403

        return f(token, *args, **kwargs)
    return decorator
