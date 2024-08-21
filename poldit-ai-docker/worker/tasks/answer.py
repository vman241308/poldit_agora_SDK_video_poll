from time import sleep
from celery import shared_task
from typing import TypedDict, List
import logging
# from sentence_transformers import SentenceTransformer
import openai
import os
import json
from shared.db.db import Database
from ai import num_tokens_from_prompt
from shared.gql.gql_strings.mutations import publish_ai_answer
from shared.gql import send_api_request

logger = logging.getLogger(__name__)
openai.api_key = os.environ['OPEN_AI_SECRET']

mongodb_dev_db = os.environ['DEV_DB_URL']
mongodb_prod_db = os.environ['PROD_DB_URL']
app_env = os.environ['APP_ENV']


class AnswerParams(TypedDict):
    token: str
    pollid: str
    question: str


@shared_task(name='myapp.tasks.get_ai_answer', bind=True, ignore_result=False)
def get_ai_answer(self, data):
    logger.info('task started')
    try:
        model = "text-davinci-003"
        input_token_length = num_tokens_from_prompt(data['question'], model)

        desired_output_tokens = 700
        max_tokens = input_token_length + desired_output_tokens

        prompt = """
        Please be as descriptive as possible and provide your response in detail like I am a novice.
        {question}
        """.format(question=data['question'])

        ai_response = openai.Completion.create(
            engine=model, prompt=prompt, max_tokens=max_tokens, n=1, stop=None, temperature=0.2)

        result = {'pollId': data['pollid'],
                  'answer': ai_response.choices[0].text.strip()}

        send_api_request(data['token'], result, publish_ai_answer)
        logger.info('task finished')
        return result

    except Exception as e:
        logger.error(f'Task {self.request.id} raised exception: {e}\n')
