from flask import Response, request
from flask_restful import Resource
from models import User, Following
from . import get_authorized_user_ids
from tests import utils
import json

class SuggestionsListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # Your code here:
        user_id = 1
        data = []
        while len(data) < 7:
            if user_id != self.current_user.id:
                is_following = 0
                follows = Following.query.filter_by(user_id=user_id).order_by('following_id').all()
                for follow in follows:
                    if follow.following_id == self.current_user.id:
                        is_following = 1
                        break
                if is_following == 0:
                    data.append(User.query.filter_by(id=user_id)[0].to_dict())
            user_id +=1
        return Response(json.dumps(data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        SuggestionsListEndpoint, 
        '/api/suggestions', 
        '/api/suggestions/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
