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
from shared.gql import send_api_request
from shared.gql.gql_strings.mutations import embed_tags
# from app.db.db import Database

# model = SentenceTransformer('all-MiniLM-L6-v2')
logger = logging.getLogger(__name__)
openai.api_key = os.environ['OPEN_AI_SECRET']

mongodb_dev_db = os.environ['DEV_DB_URL']
mongodb_prod_db = os.environ['PROD_DB_URL']
app_env = os.environ['APP_ENV']


class TagClassifier(TypedDict):
    token: str
    pollid: str
    question: str
    num_subtopics: int
    # topics: List[str]
    # subtopics: List[str]
    # topic_similarity_threshold: float
    # subtopic_similariity_threshold: float


@shared_task(name='myapp.tasks.get_keywords', bind=True, ignore_result=False)
def get_keywords(self, data):
    logger.info(f'Task {self.request.id} started\n')

    try:
        db_uri = mongodb_dev_db if app_env == 'development' else mongodb_prod_db
        db = Database(db_uri)
        topics = db.get_unique_collection("topics", 'topic')
        model = "text-davinci-003"

        prompt = """
        Provide at least one main topic and up to two topics if the question can apply to multiple topics
        from {topics} and the top 5 high-level themes that would belong to the topic for the following statement:{question}.
        The text response should be a json string with keys(topics, subtopics).
        The value for key topics would be the list of topics.  
        The value for key subtopic, would be a list of the 5 high-level themes.
        """.format(topics=topics, question=data['question'])

        input_token_length = num_tokens_from_prompt(prompt, model)
        desired_output_tokens = 500
        max_tokens = input_token_length + desired_output_tokens

        ai_response = openai.Completion.create(
            engine=model, prompt=prompt, max_tokens=max_tokens, n=1, stop=None, temperature=0.2)
        
        result = json.loads(ai_response.choices[0].text.strip())

        topics = list(set(result['topics']))
        topic_ids = db.get_collection_ids('topics', 'topic', topics)
        result['topic_ids'] = topic_ids

        final_data = {'pollid': data['pollid'], **result}
        send_api_request(data['token'], final_data, embed_tags)
        logger.info('task finished')
        return final_data


    except Exception as e:
        logger.error(f'Task {self.request.id} raised exception: {e}\n')
        raise self.retry(countdown=2**self.request.retries)

# @shared_task(name='myapp.tasks.my_task')
# def my_task(a, b):
#     sleep(5)  # This simulates a delay
#     return a + b
