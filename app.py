# load the environment variables:
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, render_template, redirect
from models.api_structure import ApiNavigator
from flask_restful import Api
import os
from models import db, User
from views import bookmarks, comments, followers, following, \
    posts, profile, stories, suggestions, post_likes, authentication, token

# new import statements:
import flask_jwt_extended  
import decorators

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DB_URL')
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False    
app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET')
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies", "json"]
app.config["JWT_COOKIE_SECURE"] = False
app.config['PROPAGATE_EXCEPTIONS'] = True 
jwt = flask_jwt_extended.JWTManager(app)

db.init_app(app)
api = Api(app)

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    # print('JWT data:', jwt_data)
    # https://flask-jwt-extended.readthedocs.io/en/stable/automatic_user_loading/
    user_id = jwt_data["sub"]
    return User.query.filter_by(id=user_id).one_or_none()

# set logged in user
with app.app_context():
    app.current_user = User.query.filter_by(id=12).one()


# Initialize routes for all of your API endpoints:
bookmarks.initialize_routes(api)
comments.initialize_routes(api)
followers.initialize_routes(api)
following.initialize_routes(api)
posts.initialize_routes(api)
post_likes.initialize_routes(api)
profile.initialize_routes(api)
stories.initialize_routes(api)
suggestions.initialize_routes(api)
authentication.initialize_routes(app)
token.initialize_routes(api)

# Server-side template for the homepage:
@app.route('/')
@decorators.jwt_or_login
def home():
    return render_template(
        'starter-client.html',
        user=flask_jwt_extended.current_user
    )

@app.route('/api')
@decorators.jwt_or_login
def api_docs():
    access_token = request.cookies.get('access_token_cookie')
    csrf = request.cookies.get('csrf_access_token')
    navigator = ApiNavigator(flask_jwt_extended.current_user)
    return render_template(
        'api/api-docs.html', 
        user=flask_jwt_extended.current_user,  #TODO: change to flask_jwt_extended.current_user
        endpoints=navigator.get_endpoints(),
        access_token=access_token,
        csrf=csrf,
        url_root=request.url_root[0:-1] # trim trailing slash
    )
    
# enables flask app to run using "python3 app.py"
if __name__ == '__main__':
    app.run()
