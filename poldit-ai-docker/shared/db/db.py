from pymongo import MongoClient


class Database:
    """
    Intitializes the DB client in order to read data from the Database which is currently Mongodb
    """

    def __init__(self, uri):
        self.client = None
        self.db = None
        self.uri = uri

    def connect(self):
        self.client = MongoClient(self.uri)
        self.db = self.client.get_database()

    def get_db(self):
        if self.db is None:
            return self.connect()
        return self.db

    def get_unique_collection(self, collection: str, document_property: str):
        """Get Unique values of a table property based on input parameters"""
        if self.db is None:
            self.connect()
        return self.db[collection].distinct(document_property)

    def get_collection_ids(self, collection: str, document_property: str, values):
        
        if self.db is None:
            self.connect()
        if isinstance(values, list):
            docs = self.db[collection].find(
                {document_property: {"$in": values}}, {'_id': 1})
            return [str(doc['_id']) for doc in docs]
        else:
            doc = self.db[collection].find_one(
                {document_property: values}, {'_id': 1})
            return str(doc['_id']) if doc else None

    def close_connection(self):
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
