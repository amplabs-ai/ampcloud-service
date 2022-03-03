import connexion
from connexion import ProblemException
import os 
from flask import jsonify 
from sqlalchemy import create_engine
from app.exception_handler import *
from app.model import Model
from flask_cors import CORS
# from celery import Celery

app = connexion.FlaskApp(__name__)
app.add_api('../api/api.yaml') 
app.app.config['DATABASE_URI'] = os.getenv('DATABASE_CONNECTION')
# READ CONFIG from env file
app.app.config['DATABASE_CONNECT_OPTIONS'] = {}
app.add_error_handler(404, client_exception)
app.add_error_handler(400, client_exception)
app.add_error_handler(ProblemException, problem_exception)
CORS(app.app)

print("Connected to database: {}".format(app.app.config['DATABASE_URI']))

if __name__ == "__main__":
    engine_ = create_engine(app.app.config['DATABASE_URI'], echo=True)
    Model.metadata.create_all(engine_)
    app.run(debug=True, host='0.0.0.0', port='4000')
