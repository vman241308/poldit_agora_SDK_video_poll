from gql import gql

embed_tags = gql("""
    mutation EmbedTags($details:String!){
        embedTags(details:$details)
    }
    """)

publish_ai_answer = gql("""
    mutation PublishAiAnswer($details:String!){
        publishAiAnswer(details:$details)
    }
    """)

store_livestream_url = gql("""
    mutation StoreVideoUrl($details:String!){
        storeVideoUrl(details:$details)
    }
    """)
