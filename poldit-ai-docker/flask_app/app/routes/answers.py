from flask import Blueprint, request, jsonify, current_app
# from sentence_transformers import SentenceTransformer
from datetime import datetime
from bson import ObjectId
from app.decorators import authenticate_user
import logging

logging.basicConfig(format='%(asctime)s - %(message)s', level=logging.INFO)

answers_bp = Blueprint('answers', __name__)


@answers_bp.route('/question/answer', methods=['POST'])
@authenticate_user
def get_answer(token):
    data = request.get_json(force=True)

    input_data = {
        'token': token,
        **data
    }

    task = current_app.celery.send_task(
        'myapp.tasks.get_ai_answer', args=[input_data])
    # task = get_ai_answer.delay(input_data)
    return jsonify({
        'message': f"Answer being generated for poll_id: {data['pollid']}. Results will be available soon.",
        'task_id': str(task.id)
    })
