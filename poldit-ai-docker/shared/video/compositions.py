import boto3
import subprocess
import os
import m3u8
from datetime import datetime, timezone
import logging


logger = logging.getLogger(__name__)

aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
aws_bucket_name = os.getenv('AWS_BUCKET_NAME')
aws_cloudfront_url = os.getenv('AWS_CLOUDFRONT_URL')

round = "geq=lum='p(X,Y)':a='if(gt(W/2,0)*gt(H/2,0),if(lte(hypot(W/2-(W/2-abs(W/2-X)),H/2-(H/2-abs(H/2-Y))),W/2),255,0),255)'"
round1 = "geq=lum='p(X,Y)':a='if(gt(abs(W/2-X),W/2-7)*gt(abs(H/2-Y),H/2-7),if(lte(hypot(7-(W/2-abs(W/2-X)),7-(H/2-abs(H/2-Y))),7),255,0),255)'"


# merging multiple user's video
def merge_multiple_files(parameters, max_length, creatorUserId, pollId, temp_dir, audioVisible):
    logging.info(f'ffmpeg parameters length: {len(parameters)}')

    audio_mixing_filter = ""
    audio_counter = 0

    for i, audioVisibleOne in enumerate(audioVisible, start=0):
        if audioVisibleOne == "true":
            audio_mixing_filter += f"[{i}:a]"
            audio_counter += 1

    audio_mixing_filter += f"amix=inputs={audio_counter}[a]"
    filter_option = ""

    match len(parameters) - 1:
        case 1:
            ffmpeg_command = f'ffmpeg -fflags +genpts -i {temp_dir}/result_0.mp4 -t {max_length} -r 24 -f mp4 {temp_dir}/result.mp4'
        case 2:
            filter_option = f"[0:v][1:v]xstack=inputs=2:layout=0_0|w0_0|[v],{audio_mixing_filter},[v][a]concat=n=1:v=1:a=1[out]"
            ffmpeg_command = f'ffmpeg -fflags +genpts -i {temp_dir}/result_0.mp4 -i {temp_dir}/result_1.mp4 -t {max_length} -filter_complex "{filter_option}" -map [out] -r 24 -f mp4 {temp_dir}/result.mp4'
        case 3:
            filter_option = f"[0:v][1:v][2:v][3:v]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[v],{audio_mixing_filter},[v][a]concat=n=1:v=1:a=1[out]"
            ffmpeg_command = f'ffmpeg -fflags +genpts -i {temp_dir}/result_0.mp4 -i {temp_dir}/result_1.mp4 -i {temp_dir}/result_2.mp4 -f lavfi -i color=black:size=1920X1080 -t {max_length} -filter_complex "{filter_option}" -map [out] -r 24 -f mp4 {temp_dir}/result.mp4'
        case 4:
            filter_option = f"[0:v][1:v][2:v][3:v]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[v],{audio_mixing_filter},[v][a]concat=n=1:v=1:a=1[out]"
            ffmpeg_command = f'ffmpeg -fflags +genpts -i {temp_dir}/result_0.mp4 -i {temp_dir}/result_1.mp4 -i {temp_dir}/result_2.mp4 -i {temp_dir}/result_3.mp4 -t {max_length} -filter_complex "{filter_option}" -map [out] -r 24 -f mp4 {temp_dir}/result.mp4'
        case 5:
            filter_option = f"[0:v][1:v][2:v][3:v][4:v][5:v]xstack=inputs=6:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0[v],{audio_mixing_filter},[v][a]concat=n=1:v=1:a=1[out]"
            ffmpeg_command = f'ffmpeg -fflags +genpts -i {temp_dir}/result_0.mp4 -i {temp_dir}/result_1.mp4 -i {temp_dir}/result_2.mp4 -i {temp_dir}/result_3.mp4 -i {temp_dir}/result_4.mp4 -i {temp_dir}/result_5.mp4 -t {max_length} -filter_complex "{filter_option}" -map [out] -r 24 -f mp4 {temp_dir}/result.mp4'
        case 6:
            filter_option = f"[0:v][1:v][2:v][3:v][4:v][5:v]xstack=inputs=6:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0[v],{audio_mixing_filter},[v][a]concat=n=1:v=1:a=1[out]"
            ffmpeg_command = f'ffmpeg -fflags +genpts -i {temp_dir}/result_0.mp4 -i {temp_dir}/result_1.mp4 -i {temp_dir}/result_2.mp4 -i {temp_dir}/result_3.mp4 -i {temp_dir}/result_4.mp4 -f lavfi -i color=black:size=1920X1080 -t {max_length} -filter_complex "{filter_option}" -map [out] -r 24 -f mp4 {temp_dir}/result.mp4'
        case 7:
            filter_option = f"[0:v][1:v][2:v][3:v][4:v][5:v][6:v][7:v][8:v]xstack=inputs=9:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1[v],{audio_mixing_filter},[v][a]concat=n=1:v=1:a=1[out]"
            ffmpeg_command = f'ffmpeg -fflags +genpts -i {temp_dir}/result_0.mp4 -i {temp_dir}/result_1.mp4 -i {temp_dir}/result_2.mp4 -i {temp_dir}/result_3.mp4 -i {temp_dir}/result_4.mp4 -i {temp_dir}/result_5.mp4 -i {temp_dir}/result_6.mp4 -f lavfi -i color=black:size=1920X1080 -f lavfi -i color=black:size=1920X1080 -t {max_length} -filter_complex "{filter_option}" -map [out] -r 24 -f mp4 {temp_dir}/result.mp4'
        case 8:
            filter_option = f"[0:v][1:v][2:v][3:v][4:v][5:v][6:v][7:v][8:v]xstack=inputs=9:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1[v],{audio_mixing_filter},[v][a]concat=n=1:v=1:a=1[out]"
            ffmpeg_command = f'ffmpeg -fflags +genpts -i {temp_dir}/result_0.mp4 -i {temp_dir}/result_1.mp4 -i {temp_dir}/result_2.mp4 -i {temp_dir}/result_3.mp4 -i {temp_dir}/result_4.mp4 -i {temp_dir}/result_5.mp4 -i {temp_dir}/result_6.mp4 -i {temp_dir}/result_7.mp4 -f lavfi -i color=black:size=1920X1080 -t {max_length} -filter_complex "{filter_option}" -map [out] -r 24 -f mp4 {temp_dir}/result.mp4'

    logging.info(f'ffmpeg filter command: {ffmpeg_command}')
    subprocess.run(ffmpeg_command, shell=True)

    s3_client = boto3.client('s3', aws_access_key_id=aws_access_key_id,
                             aws_secret_access_key=aws_secret_access_key)

    upload_file_path = f"{temp_dir}/result.mp4"

    # Upload the file to S3
    print("~~~~~~~~~~~~~~~~~ Uploading file to S3 ~~~~~~~~~~~~~~~~~~~")
    with open(upload_file_path, 'rb') as file:
        s3_client.upload_fileobj(
            file, aws_bucket_name, f'videoPolls/{creatorUserId}/{pollId}/{pollId}.mp4', ExtraArgs={'ContentType': "video/mp4"})

    return f'{aws_cloudfront_url}/videoPolls/{creatorUserId}/{pollId}/{pollId}.mp4'


def total_duration_by_url(url: str) -> int:  # total duration from m3u8 url
    try:
        playlist = m3u8.load(url)
        if playlist.playlists:
            return total_duration_by_url(playlist.playlists[0].absolute_uri)
        return int(sum(x.duration for x in playlist.segments))
    except Exception:
        return 0


def black_time_calculation(time_stamp_arr, recording_startTime, recording_endTime):
    black_time_stamp_start = 0
    black_time_stamp_end = 0
    black_time_stamp_arr = []
    if len(time_stamp_arr) == 0:
        return 0

    for i, time_stamp_obj in enumerate(time_stamp_arr, start=0):
        if i == 0:
            black_time_stamp_start = recording_startTime
            black_time_stamp_end = time_stamp_obj.startTime
            black_time_stamp_arr.append(time_stamp(
                black_time_stamp_start, black_time_stamp_end, "", "avatar_video"))
        else:
            if (time_stamp_arr[i].startTime != time_stamp_arr[i-1].endTime):
                black_time_stamp_start = time_stamp_arr[i-1].endTime
                black_time_stamp_end = time_stamp_arr[i].startTime
                black_time_stamp_arr.append(time_stamp(
                    black_time_stamp_start, black_time_stamp_end, "", "avatar_video"))

        if i == len(time_stamp_arr) - 1:
            black_time_stamp_start = time_stamp_obj.endTime
            black_time_stamp_end = recording_endTime
            black_time_stamp_arr.append(time_stamp(
                black_time_stamp_start, black_time_stamp_end, "", "avatar_video"))

    return black_time_stamp_arr


def calculation_next_utc_time(previous_unix_time, duration):
    x = previous_unix_time
    y = duration.zfill(len(x))

    month_days = 1

    match x[-13:-11]:
        case "01":
            month_days = 31
        case "02":
            month_days = 28
        case "03":
            month_days = 31
        case "04":
            month_days = 30
        case "05":
            month_days = 31
        case "06":
            month_days = 30
        case "07":
            month_days = 31
        case "08":
            month_days = 31
        case "09":
            month_days = 30
        case "10":
            month_days = 31
        case "11":
            month_days = 30
        case "12":
            month_days = 31

    division_milisecs = str((int(x[-3:]) + int(y[-3:])) % 1000).zfill(3)
    modulus_milisecs = (int(x[-3:]) + int(y[-3:])) // 1000

    division_secs = str(
        (int(x[-5:-3]) + int(y[-5:-3]) + modulus_milisecs) % 60).zfill(2)
    modulus_secs = (int(x[-5:-3]) + int(y[-5:-3]) + modulus_milisecs) // 60

    division_mins = str(
        (int(x[-7:-5]) + int(y[-7:-5]) + modulus_secs) % 60).zfill(2)
    modulus_mins = (int(x[-7:-5]) + int(y[-7:-5]) + modulus_secs) // 60

    division_hours = str(
        (int(x[-9:-7]) + int(y[-9:-7]) + modulus_mins) % 24).zfill(2)
    modulus_hours = (int(x[-9:-7]) + int(y[-9:-7]) + modulus_mins) // 24

    division_days = str(
        (int(x[-11:-9]) + int(y[-11:-9]) + modulus_hours) % (month_days+1)).zfill(2)
    modulus_days = (int(x[-11:-9]) + int(y[-11:-9]) +
                    modulus_hours) // (month_days+1)

    division_months = str(
        (int(x[-13:-11]) + int(y[-13:-11]) + modulus_days) % 13).zfill(2)
    modulus_months = (int(x[-13:-11]) + int(y[-13:-11]) + modulus_days) // 13

    division_years = str(
        (int(x[-17:-13]) + int(y[-17:-13]) + modulus_months) % 10000).zfill(4)

    result = division_years+division_months+division_days + \
        division_hours+division_mins+division_secs+division_milisecs

    return result


def total_timestamp_caculation(VideoURLs, type):
    SegmentVideo = []
    bucket_url = ""

    for inx, VideoURL in enumerate(VideoURLs, start=0):
        bucket_url = VideoURL.rsplit("/", 1)[0]

        if VideoURL == "":
            return ""

        playlist = m3u8.load(VideoURL)
        for segment in playlist.segments:
            if (type == "video") or (type == "screen_video"):
                index = "video_"
            else:
                index = "audio_"

            utc_timestamp = segment.uri.split(index)[1].split(".")[0]

            agora_timeStamp = int(datetime.strptime(utc_timestamp, "%Y%m%d%H%M%S%f").replace(
                tzinfo=timezone.utc).timestamp() * 1000)
            next_utc_timestamp = calculation_next_utc_time(
                utc_timestamp, str(int(segment.duration*1000)))

            next_agora_timeStamp = int(datetime.strptime(next_utc_timestamp, "%Y%m%d%H%M%S%f").replace(
                tzinfo=timezone.utc).timestamp() * 1000)

            segment_uri = bucket_url + "/" + segment.uri

            SegmentVideo.append(
                time_stamp(agora_timeStamp, next_agora_timeStamp, segment_uri, "video"))

    return SegmentVideo


def default_bg_video_generation(avatar_url, role_bg_color, recording_startTime, recording_endTime, firstName, lastName, role, userName, temp_dir, assets_file_dir, i):
    total_duration = (int(recording_endTime)/1000 -
                      int(recording_startTime)/1000)
    avatar_image = f' -i {avatar_url}' if avatar_url else " -f lavfi -i color=pink"

    name_on_avatar = firstName[0].upper() + lastName[0].upper()
    name_on_avatar_filter = "" if avatar_url else f",drawtext=fontfile={assets_file_dir}/font.ttf:text={name_on_avatar}:fontcolor=white:fontsize=90:x=((main_w-text_w)/2):y=((main_h-text_h)/2)"
    avatar_image_command = f'ffmpeg -fflags +genpts -f lavfi -i color=#2f3747:size=1920x1080 {avatar_image} -f lavfi -i color={role_bg_color}:size=75x30 -t {total_duration} -filter_complex "[1]crop=ih:ih,scale=200:200,format=yuva420p,{round}[circle_avatar],[2]format=yuva420p,{round1}[role_round],[0][circle_avatar]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2[bg_switch_1],[bg_switch_1][role_round]overlay=H/64:H-3*H/64[role_result],[role_result]drawtext=fontfile={assets_file_dir}/font.ttf:text={userName}:fontcolor=white:fontsize=30:x=((main_w-text_w)/2):y=((main_h-text_h)/2+130),drawtext=fontfile={assets_file_dir}/font.ttf:text={role}:fontcolor=white:fontsize=20:x=(75/2+H/64-text_w/2):y=(H-3*H/64+30/2-text_h/2){name_on_avatar_filter}[out]" -map "[out]" -r 24 -f mp4 {temp_dir}/black_video_{i}.mp4'
    subprocess.run(avatar_image_command, shell=True)
    return f'black_video_{i}.mp4'


def webcam_video_generation(total_webcamVideo_time, avatar_url, role_bg_color, userName, role, i, recording_startTime, firstName, lastName, temp_dir, assets_file_dir, webcam_audio_visible, screen_video_visible):

    filter_options = ""

    avatar_image = f' -i {avatar_url}' if avatar_url else " -f lavfi -i color=pink"
    name_on_avatar = firstName[0].upper() + lastName[0].upper()
    webcamVideo_ffmpeg_command = f"ffmpeg -i {temp_dir}/black_video_{i}.mp4"

    for j, webcamVideo_time in enumerate(total_webcamVideo_time, start=0):
        duration = (int(webcamVideo_time.endTime)/1000 -
                    int(webcamVideo_time.startTime)/1000)

        name_on_avatar_fil = "" if avatar_url else f",drawtext=fontfile={assets_file_dir}/font.ttf:text={name_on_avatar}:fontcolor=white:fontsize=80:x=(main_h/32+105-text_w/2):y=(main_h/32+75-text_h/2)"
        webcam_video_command = f'ffmpeg -i {webcamVideo_time.url} {avatar_image} -f lavfi -i color={role_bg_color}:size=75x30 -t {duration} -filter_complex "[0]scale=1920x1080[scale0],[1]crop=ih:ih,scale=150:150,format=yuva420p,{round}[circle_avatar],[2]format=yuva420p,{round1}[role_round],[scale0][circle_avatar]overlay=H/32+30:H/32,drawbox=y=ih-ih/16:color=black@0.5:width=iw:height=ih/16:t=fill[bg_switch_1],[bg_switch_1][role_round]overlay=H/64:H-3*H/64[role_result],[role_result]drawtext=fontfile={assets_file_dir}/font.ttf:text={userName}:fontcolor=white:fontsize=30:x=(H/32+105-text_w/2):y=(H/32+160+35/2-text_h/2),drawtext=fontfile={assets_file_dir}/font.ttf:text={role}:fontcolor=white:fontsize=20:x=(75/2+H/64-text_w/2):y=(H-3*H/64+30/2-text_h/2){name_on_avatar_fil}[out]" -map "[out]"  -r 24 -f mp4 {temp_dir}/webcam_video_{i}_{j}.mp4'
        subprocess.run(webcam_video_command, shell=True)
        webcamVideo_ffmpeg_command += f' -i {temp_dir}/webcam_video_{i}_{j}.mp4'

        startTime = int(webcamVideo_time.startTime) / \
            1000 - int(recording_startTime)/1000
        endTime = startTime + duration

        enable_option = f"'between(t\,{startTime},{endTime})'"
        if j+1 == 1:
            if j == len(total_webcamVideo_time) - 1:
                filter_options += f'"[{j+1}:v]setpts=PTS-STARTPTS+{startTime}/TB[top{j+1}];[0:v][top{j+1}]overlay=enable={enable_option}:x=0:y=0[outv]" -map [outv]'
            else:
                filter_options += f'"[{j+1}:v]setpts=PTS-STARTPTS+{startTime}/TB[top{j+1}];[0:v][top{j+1}]overlay=enable={enable_option}:x=0:y=0[v{j+1}],'
        else:
            if j == len(total_webcamVideo_time) - 1:
                filter_options += f'[{j+1}:v]setpts=PTS-STARTPTS+{startTime}/TB[top{j+1}];[v{j}][top{j+1}]overlay=enable={enable_option}:x=0:y=0[outv]" -map [outv]'
            else:
                filter_options += f'[{j+1}:v]setpts=PTS-STARTPTS+{startTime}/TB[top{j+1}];[v{j}][top{j+1}]overlay=enable={enable_option}:x=0:y=0[v{j+1}],'

    if webcam_audio_visible == "false" and screen_video_visible == "false":
        output_name = f"result_{i}"
    else:
        output_name = f"webCamVideo_{i}"

    webcamVideo_ffmpeg_command += f' {"-filter_complex " if total_webcamVideo_time else "-map 0:v" }' + \
        filter_options + \
        f' -r 24 {temp_dir}/{output_name}.mp4'

    subprocess.run(webcamVideo_ffmpeg_command, shell=True)
    return f'{output_name}.mp4'


def screen_video_generation(total_screenVideo_time, recording_startTime, role_bg_color, userName, role, i, temp_dir, assets_file_dir, webcam_video_visible, webcam_audio_visible, screen_audio_visible):
    if webcam_audio_visible == "true":
        screenVideo_ffmpeg_command = f'ffmpeg -i {temp_dir}/webcam_result_{i}.mp4'
    else:
        if webcam_video_visible == "true":
            screenVideo_ffmpeg_command = f'ffmpeg -i {temp_dir}/webCamVideo_{i}.mp4'
        else:
            screenVideo_ffmpeg_command = f'ffmpeg -i {temp_dir}/black_video_{i}.mp4'

    filter_options = ""

    for j, screenVideo_time in enumerate(total_screenVideo_time, start=0):
        duration = (int(screenVideo_time.endTime)/1000 -
                    int(screenVideo_time.startTime)/1000)

        if screenVideo_time.type == "video":

            startTime = int(screenVideo_time.startTime) / \
                1000 - int(recording_startTime)/1000
            endTime = startTime + \
                (int(screenVideo_time.endTime)/1000 -
                 int(screenVideo_time.startTime)/1000)

            overlay_video_command = f'ffmpeg -i {temp_dir}/webCamVideo_{i}.mp4 -ss {startTime} -t {endTime} {temp_dir}/avatar_video_{i}_{j}.mp4'
            subprocess.run(overlay_video_command, shell=True)

            enable_option = f"'between(t\,{startTime},{endTime})'"
            sharingScreen = "Sharing screen"
            screen_video_command = f'ffmpeg -i {screenVideo_time.url} -i {temp_dir}/avatar_video_{i}_{j}.mp4 -f lavfi -i color={role_bg_color}:size=75x30 -f lavfi -i color=#5a97db:size=150x30 -t {duration} -filter_complex "[0]scale=1920x1080[v0],[1]crop=ih:ih,scale=150:150,format=yuva420p,{round}[circle_avatar],[2]format=yuva420p,{round1}[role_round],[3]format=yuva420p,{round1}[sharing_round],[v0][circle_avatar]overlay=H/32+30:H/32,drawbox=y=ih-ih/16:color=black@0.5:width=iw:height=ih/16:t=fill[bg_switch_1],[bg_switch_1][role_round]overlay=H/64:H-3*H/64[role_result],[role_result][sharing_round]overlay=H/64+90:H-3*H/64[sharing_result],[sharing_result]drawtext=fontfile={assets_file_dir}/font.ttf:text={userName}:fontcolor=white:fontsize=30:x=(H/32+105-text_w/2):y=(H/32+160+35/2-text_h/2),drawtext=fontfile={assets_file_dir}/font.ttf:text={role}:fontcolor=white:fontsize=20:x=(75/2+H/64-text_w/2):y=(H-3*H/64+30/2-text_h/2),drawtext=fontfile={assets_file_dir}/font.ttf:text={sharingScreen}:fontcolor=white:fontsize=20:x=(165+H/64-text_w/2):y=(H-3*H/64+30/2-text_h/2)[out]" -map "[out]" -r 24 -f mp4 {temp_dir}/screen_video_{i}_{j}.mp4'
            subprocess.run(screen_video_command, shell=True)
            screenVideo_ffmpeg_command += f' -i {temp_dir}/screen_video_{i}_{j}.mp4'

            if j+1 == 1:
                if j == len(total_screenVideo_time) - 1:
                    filter_options += f'"[{j+1}:v]setpts=PTS-STARTPTS+{startTime}/TB[top{j+1}];[0:v][top{j+1}]overlay=enable={enable_option}:x=0:y=0[v{j+1}]"'
                else:
                    filter_options += f'"[{j+1}:v]setpts=PTS-STARTPTS+{startTime}/TB[top{j+1}];[0:v][top{j+1}]overlay=enable={enable_option}:x=0:y=0[v{j+1}],'
            else:
                if j == len(total_screenVideo_time) - 1:
                    filter_options += f'[{j+1}:v]setpts=PTS-STARTPTS+{startTime}/TB[top{j+1}];[v{j}][top{j+1}]overlay=enable={enable_option}:x=0:y=0[v{j+1}]"'
                else:
                    filter_options += f'[{j+1}:v]setpts=PTS-STARTPTS+{startTime}/TB[top{j+1}];[v{j}][top{j+1}]overlay=enable={enable_option}:x=0:y=0[v{j+1}],'

    if screen_audio_visible == "false":
        output_name = f"result_{i}"
    else:
        output_name = f"screenVideo_{i}"

    audio_filter = "-map 0:a" if webcam_audio_visible == "true" else ""

    screenVideo_ffmpeg_command += f' -filter_complex ' + \
        filter_options + \
        f' -map [v{len(total_screenVideo_time)}] {audio_filter} -r 24 {temp_dir}/{output_name}.mp4'

    subprocess.run(screenVideo_ffmpeg_command, shell=True)
    return f'{output_name}.mp4'


def webcam_audio_mixing(total_webcamAudio_time, recording_startTime, recording_endTime, webcam_video_visible, screen_video_visible, temp_dir, assets_file_dir, i):
    if webcam_video_visible == "true":
        audio_mixing_ffmeg_command = f"ffmpeg -i {temp_dir}/webCamVideo_{i}.mp4"
    else:
        audio_mixing_ffmeg_command = f"ffmpeg -i {temp_dir}/black_video_{i}.mp4"

    for ind, webcamAudioOne in enumerate(total_webcamAudio_time, start=0):
        audio_mixing_ffmeg_command += f" -i {webcamAudioOne.url}"

    audio_mixing_ffmeg_command += ' -filter_complex "'
    for index, webcamAudioOne in enumerate(total_webcamAudio_time, start=0):
        delay_duration = int(int(webcamAudioOne.startTime) /
                             1000 - int(recording_startTime)/1000)
        audio_mixing_ffmeg_command += f"[{index+1}]adelay=delays={delay_duration}s:all=1[r{index+1}];"

    for j, webcamAudioOne in enumerate(total_webcamAudio_time, start=0):
        if j == len(total_webcamAudio_time) - 1:
            audio_mixing_ffmeg_command += f'[r{j+1}]amix=inputs={len(total_webcamAudio_time)}[out]"'
        else:
            audio_mixing_ffmeg_command += f"[r{j+1}]"

    audio_mixing_ffmeg_command += f' -map 0:v -map "[out]" {temp_dir}/webcam_muted_{i}.mp4'

    subprocess.run(audio_mixing_ffmeg_command, shell=True)
    webcam_muted_ffmpeg = f'ffmpeg -i {temp_dir}/webcam_muted_{i}.mp4'

    for idx, webcamAudioOne in enumerate(total_webcamAudio_time, start=0):
        if idx == len(total_webcamAudio_time) - 1:
            webcam_muted_ffmpeg += f' -i {assets_file_dir}/mIcon.png -i {assets_file_dir}/mIcon.png -filter_complex "'
        else:
            webcam_muted_ffmpeg += f" -i {assets_file_dir}/mIcon.png"

    for ix, webcamAudioOne in enumerate(total_webcamAudio_time, start=0):
        if ix == len(total_webcamAudio_time) - 1:
            webcam_muted_ffmpeg += f"[{ix+1}]scale=30:30[v{ix+1}],[{ix+2}]scale=30:30[v{ix+2}],"
        else:
            webcam_muted_ffmpeg += f"[{ix+1}]scale=30:30[v{ix+1}],"

    for ind, webcamAudioOne in enumerate(total_webcamAudio_time, start=0):
        if ind == 0:
            sTime = int(recording_startTime)/1000 - \
                int(recording_startTime)/1000
            eTime = int(webcamAudioOne.startTime)/1000 - \
                int(recording_startTime)/1000

            sLTime = int(webcamAudioOne.endTime) / 1000 - \
                int(recording_startTime)/1000
            eLTime = int(recording_endTime)/1000 - \
                int(recording_startTime)/1000
            last_enable_option = f"'between(t\,{sLTime},{eLTime})'"

            enable_options = f"'between(t\,{sTime},{eTime})'"

            if len(total_webcamAudio_time) == 1:
                webcam_muted_ffmpeg += f'[0:v][v{ind+1}]overlay=W-w-H/64:H-h-H/64:enable={enable_options}[av{ind}],[av{ind}][v{ind+2}]overlay=W-w-H/64:H-h-H/64:enable={last_enable_option}[out]"'
            else:
                webcam_muted_ffmpeg += f'[0:v][v{ind+1}]overlay=W-w-H/64:H-h-H/64:enable={enable_options}[av{ind}],'
        else:
            sTime = int(
                total_webcamAudio_time[ind-1].endTime)/1000 - int(recording_startTime)/1000
            eTime = int(webcamAudioOne.startTime)/1000 - \
                int(recording_startTime)/1000

            enable_options = f"'between(t\,{sTime},{eTime})'"

            if ind == len(total_webcamAudio_time) - 1:
                sLTime = int(webcamAudioOne.endTime) / \
                    1000 - int(recording_startTime)/1000
                eLTime = int(recording_endTime)/1000 - \
                    int(recording_startTime)/1000
                last_enable_option = f"'between(t\,{sLTime},{eLTime})'"
                webcam_muted_ffmpeg += f'[av{ind-1}][v{ind+1}]overlay=W-w-H/64:H-h-H/64:enable={enable_options}[av{ind}],[av{ind}][v{ind+2}]overlay=W-w-H/64:H-h-H/64:enable={last_enable_option}[out]"'
            else:
                webcam_muted_ffmpeg += f"[av{ind-1}][v{ind+1}]overlay=W-w-H/64:H-h-H/64:enable={enable_options}[av{ind}],"

    if screen_video_visible == "false":
        output_name = f"result_{i}"
    else:
        output_name = f"webcam_result_{i}"

    webcam_muted_ffmpeg += f' -map 0:a -map "[out]" {temp_dir}/{output_name}.mp4'

    subprocess.run(webcam_muted_ffmpeg, shell=True)
    return f"{output_name}.mp4"


def screen_audio_mixing(total_screenAudio_time, recording_startTime, recording_endTime, webcam_audio_visible, temp_dir, assets_file_dir, i):
    audio_mixing_ffmeg_command = f"ffmpeg -i {temp_dir}/screenVideo_{i}.mp4"
    for ind, screenAudioOne in enumerate(total_screenAudio_time, start=0):
        audio_mixing_ffmeg_command += f" -i {screenAudioOne.url}"

    audio_mixing_ffmeg_command += ' -filter_complex "'
    for index, screenAudioOne in enumerate(total_screenAudio_time, start=0):
        delay_duration = int(int(screenAudioOne.startTime) /
                             1000 - int(recording_startTime)/1000)
        audio_mixing_ffmeg_command += f"[{index+1}]adelay=delays={delay_duration}s:all=1[r{index+1}];"

    for j, screenAudioOne in enumerate(total_screenAudio_time, start=0):
        if j == len(total_screenAudio_time) - 1:
            if webcam_audio_visible == "true":
                audio_mixing_ffmeg_command += f'[r{index+1}][0:a]amix=inputs={len(total_screenAudio_time)+1}[a]"'
            else:
                audio_mixing_ffmeg_command += f'[r{index+1}]amix=inputs={len(total_screenAudio_time)}[a]"'
        else:
            audio_mixing_ffmeg_command += f"[r{j+1}]"

    audio_mixing_ffmeg_command += f' -map 0:v -map "[a]"  {temp_dir}/screen_muted_{i}.mp4'
    subprocess.run(audio_mixing_ffmeg_command, shell=True)

    screen_muted_ffmpeg = f'ffmpeg -i {temp_dir}/screen_muted_{i}.mp4'

    for idx, screenAudioOne in enumerate(total_screenAudio_time, start=0):
        if idx == len(total_screenAudio_time) - 1:
            screen_muted_ffmpeg += f' -i {assets_file_dir}/mIcon.png -i {assets_file_dir}/mIcon.png -filter_complex "'
        else:
            screen_muted_ffmpeg += f" -i {assets_file_dir}/mIcon.png"

    for ix, screenAudioOne in enumerate(total_screenAudio_time, start=0):
        if ix == len(total_screenAudio_time) - 1:
            screen_muted_ffmpeg += f"[{ix+1}]scale=30:30[v{ix+1}],[{ix+2}]scale=30:30[v{ix+2}],"
        else:
            screen_muted_ffmpeg += f"[{ix+1}]scale=30:30[v{ix+1}],"

    for ind, screenAudioOne in enumerate(total_screenAudio_time, start=0):
        if ind == 0:
            sTime = int(recording_startTime)/1000 - \
                int(recording_startTime)/1000
            eTime = int(screenAudioOne.startTime)/1000 - \
                int(recording_startTime)/1000

            enable_options = f"'between(t\,{sTime},{eTime})'"
            screen_muted_ffmpeg += f"[0:v][v{ind+1}]overlay=W-w-H/64:H-h-H/64:enable={enable_options}[av{ind}],"
        else:
            sTime = int(
                total_screenAudio_time[ind-1].endTime)/1000 - int(recording_startTime)/1000
            eTime = int(screenAudioOne.startTime)/1000 - \
                int(recording_startTime)/1000

            enable_options = f"'between(t\,{sTime},{eTime})'"

            if ind == len(total_screenAudio_time) - 1:
                sLTime = int(screenAudioOne.endTime) / \
                    1000 - int(recording_startTime)/1000
                eLTime = int(recording_endTime)/1000 - \
                    int(recording_startTime)/1000
                last_enable_option = f"'between(t\,{sLTime},{eLTime})'"
                screen_muted_ffmpeg += f'[av{ind-1}][v{ind+1}]overlay=W-w-H/64:H-h-H/64:enable={enable_options}[av{ind}],[av{ind}][v{ind+2}]overlay=W-w-H/64:H-h-H/64:enable={last_enable_option}[out]"'
            else:
                screen_muted_ffmpeg += f"[av{ind-1}][v{ind+1}]overlay=W-w-H/64:H-h-H/64:enable={enable_options}[av{ind}],"

    screen_muted_ffmpeg += f' -map 0:a -map "[out]" {temp_dir}/screen_video_result_{i}.mp4'
    subprocess.run(screen_muted_ffmpeg, shell=True)

    return f"screen_video_result_{i}.mp4"


class time_stamp:
    def __init__(self, startTime, endTime, url, type):
        self.startTime = startTime
        self.endTime = endTime
        self.url = url
        self.type = type
