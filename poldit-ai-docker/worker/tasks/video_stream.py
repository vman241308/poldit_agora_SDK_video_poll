from celery import shared_task
from typing import TypedDict, List
import logging
import os
from shared.gql.graphql import send_api_request
from shared.gql.gql_strings.mutations import store_livestream_url
from shared.video.compositions import merge_multiple_files, screen_video_generation, total_timestamp_caculation, webcam_video_generation, default_bg_video_generation, webcam_audio_mixing, screen_audio_mixing
import tempfile
import shutil


logger = logging.getLogger(__name__)


@shared_task(name='myapp.tasks.composite_video', bind=True, ignore_result=False)
def composite_video(self, parameters):
    logger.info(f'Task {self.request.id} started\n')

    temp_dir = '/worker/temp'
    assets_file_dir = '/worker/assets'

    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
    # temp_dir = tempfile.mkdtemp(dir='/worker')

    try:
        recording_startTime = parameters[len(
            parameters)-1]["recordingStartTime"]
        recording_endTime = parameters[len(parameters)-1]["recordingEndTime"]
        creatorUserId = parameters[len(parameters)-1]["creatorUserId"]
        pollId = parameters[len(parameters)-1]["pollId"]

        audioVisible = []

        for i in range(len(parameters)-1):
            userName = parameters[i]["userName"]
            role = parameters[i]["role"]
            role_bg_color = "#ff4700" if role == "Host" else "#44bd7c"
            avatar_url = parameters[i]["avatarURL"]
            firstName = parameters[i]["firstName"]
            lastName = parameters[i]["lastName"]

            webcam_video_visible = "true" if parameters[i]["webcamVideoURL"] else "false"
            screen_video_visible = "true" if parameters[i]["screenVideoURL"] else "false"
            webcam_audio_visible = "true" if parameters[i]["webcamAudioURL"] else "false"
            screen_audio_visible = "true" if parameters[i]["screenAudioURL"] else "false"

            if webcam_audio_visible == "true" and screen_audio_visible == "true":
                audioVisible.append("false")
            else:
                audioVisible.append("true")

            default_bg_video_generation(avatar_url, role_bg_color, recording_startTime,
                                        recording_endTime, firstName, lastName, role, userName, temp_dir, assets_file_dir, i)

            if parameters[i]["webcamVideoURL"]:
                total_webcamVideo_time = total_timestamp_caculation(
                    parameters[i]["webcamVideoURL"], "video")

                webcam_video_generation(
                    total_webcamVideo_time, avatar_url, role_bg_color, userName, role, i, recording_startTime, firstName, lastName, temp_dir, assets_file_dir, webcam_audio_visible, screen_video_visible)

            if parameters[i]["webcamAudioURL"]:
                total_webcamAudio_time = total_timestamp_caculation(
                    parameters[i]["webcamAudioURL"], "Audio")

                webcam_audio_mixing(total_webcamAudio_time, recording_startTime,
                                    recording_endTime, webcam_video_visible, screen_video_visible, temp_dir, assets_file_dir, i)

            if parameters[i]["screenVideoURL"]:
                total_screenVideo_time = total_timestamp_caculation(
                    parameters[i]["screenVideoURL"], "screen_video")

                screen_video_generation(
                    total_screenVideo_time, recording_startTime, role_bg_color, userName, role, i, temp_dir, assets_file_dir, webcam_video_visible, webcam_audio_visible, screen_audio_visible)

                if parameters[i]["screenAudioURL"]:
                    total_screenAudio_time = total_timestamp_caculation(
                        parameters[i]["screenAudioURL"], "screen_audio")
                    screen_audio_mixing(total_screenAudio_time, recording_startTime,
                                        recording_endTime, webcam_audio_visible, temp_dir, assets_file_dir, i)

        max_length = int(recording_endTime)/1000 - \
            int(recording_startTime)/1000

        logger.info('merge_multiple_files started')
        cloundFrontURL = merge_multiple_files(
            parameters, max_length, creatorUserId, pollId, temp_dir, audioVisible)

        logger.info('merge_multiple_files complete')

        final_data = {'url': cloundFrontURL,
                      'pollId': pollId}

        send_api_request("", final_data, store_livestream_url)
        logger.info('task finished')
        return final_data

    except Exception as e:
        logger.error(f'Task {self.request.id} raised exception: {e}\n')
        # raise self.retry(countdown=2**self.request.retries)

    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
