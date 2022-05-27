from app.archive_constants import AMPLABS_DB_URL
import connexion
from connexion import ProblemException
import os
from flask import jsonify, render_template
from sqlalchemy import create_engine
from app.exception_handler import *
from app.model import Model
from flask_cors import CORS
from flask_compress import Compress
from app.controllers.dashboard_share_controller import dashboard_audit, dashboard_share_linkedin, dashboard_share_url
import logging


# Create and configure logger
logging.basicConfig(filename="logs/audit.log",
                    format='%(asctime)s %(levelname)s "%(message)s"',
                    datefmt='%y/%m/%d-%H:%M:%S',
                    level=logging.INFO)

app = connexion.FlaskApp(__name__)
app.add_api('../api/api.yaml', options={'swagger_url': '/api'})
app.app.config['DATABASE_URI'] = AMPLABS_DB_URL
# READ CONFIG from env file
app.app.config['DATABASE_CONNECT_OPTIONS'] = {}
app.add_error_handler(404, client_exception)
app.add_error_handler(400, client_exception)
app.add_error_handler(401, unauthorized_exception)
app.add_error_handler(ProblemException, problem_exception)
CORS(app.app, origins=["http://localhost:3000"], supports_credentials=True)
Compress(app.app)
print("Connected to database: {}".format(app.app.config['DATABASE_URI']))

app.add_url_rule('/dashboard/audit', 'dashboard_audit', dashboard_audit)
app.add_url_rule('/dashboard/share-id', 'dashboard_share_url', dashboard_share_url, methods = ['POST'])
app.add_url_rule('/dashboard/share-linkedin', 'dashboard_share_linkedin', dashboard_share_linkedin, methods = ['POST'])

@app.route("/")
def my_index():
    return render_template("index.html", flask_token="amplabs token")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return render_template('index.html')

if __name__ == "__main__":
    engine_ = create_engine(app.app.config['DATABASE_URI'], echo=True)
    Model.metadata.create_all(engine_)

    app.run(debug=True, host='0.0.0.0', port='4000')
