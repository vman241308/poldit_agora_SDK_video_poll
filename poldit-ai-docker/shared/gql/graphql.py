import json
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from typing import TypedDict, List
import os
# from env import api_url,  poldit_be_port
dav_api_url = os.environ['API_URL_DEV']
prod_api_url = os.environ['API_URL_PROD']
app_env = os.environ['APP_ENV']
poldit_be_port = os.environ['POLDIT_BACKEND_PORT']


def send_api_request(token, data, gql_query):

    if app_env == 'development':
        url = f"http://{dav_api_url}:{poldit_be_port}/graphql"
    else:
        url = f"https://{prod_api_url}/graphql"

    transport = RequestsHTTPTransport(
        url=url,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {token}" if token else ""
        },
        use_json=True,
    )

    client = Client(transport=transport)

    result = client.execute(gql_query, variable_values={
                            'details': json.dumps(data)})

    # result = client.execute(gql_query, variable_values={'pollid': classification_data['pollid'],
    #                         'topic': classification_data['topic'], 'subtopics': classification_data['subtopics']})

    if 'errors' in result:
        print(f"GraphQL errors: {result['errors']}")
