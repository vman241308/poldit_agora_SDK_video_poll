from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from app.decorators import authenticate_user
import logging

logger = logging.getLogger(__name__)

tag_bp = Blueprint('tags', __name__)


@tag_bp.route('/', methods=['GET'])
def main():
    return f"Poldit-AI-Api is working!"


@tag_bp.route('/health', methods=['GET'])
def health_check():
    return "Healthy", 200


@tag_bp.route('/question/classify', methods=['POST'])
@authenticate_user
def classify_question(token):
    data = request.get_json(force=True)
    poll_id = data['pollid']
    question = data['question']
    num_subtopics = data.get('num_subtopics', 1)

    input_data = {
        'token': token,
        'pollid': poll_id,
        'question': question,
        'num_subtopics': num_subtopics,
        # 'topic_similarity_threshold': 0.1,
        # 'subtopic_similariity_threshold': 0.4
    }

    task = current_app.celery.send_task(
        'myapp.tasks.get_keywords', args=[input_data])

    return jsonify({
        'message': 'Classification started. Results will be available soon.',
        'task_id': str(task.id)
    })


@tag_bp.route('/task', methods=['GET'])
def start_task():
    task = current_app.celery.send_task('myapp.tasks.my_task', args=[1, 2])
    return jsonify({'task_id': task.id}), 202


@tag_bp.route('/compositionVideo', methods=['POST'])
# @authenticate_user
def composition_video():
    parameters = request.get_json(force=True)
    task = current_app.celery.send_task('myapp.tasks.composite_video', args=[parameters])
    return jsonify({
        'message': 'Video Composition Started.',
        'task_id': str(task.id)
    })



# def composition_video():
#     try:
#         parameters = json.loads(request.data)

#         recording_startTime = parameters[len(
#             parameters)-1]["recordingStartTime"]
#         recording_endTime = parameters[len(parameters)-1]["recordingEndTime"]
#         creatorUserId = parameters[len(parameters)-1]["creatorUserId"]
#         pollId = parameters[len(parameters)-1]["pollId"]

#         for i in range(len(parameters)-1):
#             userName = parameters[i]["userName"]
#             role = parameters[i]["role"]
#             role_bg_color = "#ff4700" if role == "Host" else "#44bd7c"
#             avatar_url = parameters[i]["avatarURL"]
#             firstName = parameters[i]["firstName"]
#             lastName = parameters[i]["lastName"]

#             total_webcamVideo_time = total_timestamp_caculation(
#                 parameters[i]["webcamVideoURL"], recording_startTime, recording_endTime, "video")

#             total_webcamAudio_time = total_timestamp_caculation(
#                 parameters[i]["webcamAudioURL"], recording_startTime, recording_endTime, "Audio") if parameters[i]["webcamAudioURL"] else ""

#             webcam_Video_generation(
#                 total_webcamVideo_time, total_webcamAudio_time, avatar_url, role_bg_color, userName, role, i, recording_startTime, recording_endTime, firstName, lastName)

#             total_screenVideo_time = total_timestamp_caculation(
#                 parameters[i]["screenVideoURL"], recording_startTime, recording_endTime, "screen_video")

#             total_screenAudio_time = total_timestamp_caculation(
#                 parameters[i]["screenAudioURL"], recording_startTime, recording_endTime, "screen_audio") if parameters[i]["screenAudioURL"] else ""

#             screen_Video_generation(
#                 total_screenVideo_time, total_screenAudio_time, recording_startTime, avatar_url, role_bg_color, userName, role, i)

#         max_length = int(recording_endTime)/1000 - \
#             int(recording_startTime)/1000

#         cloundFrontURL = merge_multiple_files(
#             parameters, max_length, creatorUserId, pollId)

#         return cloundFrontURL

#     except Exception as e:
#         return str(e)
