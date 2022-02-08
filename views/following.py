from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
from my_decorators import is_valid_int
import json

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # Your code here
        follows = Following.query.filter_by(user_id=self.current_user.id).order_by('following_id').all()
        following_list_of_dictionaries = [
            follow.to_dict_following() for follow in follows
        ]
        return Response(json.dumps(following_list_of_dictionaries), mimetype="application/json", status=200)

    def post(self):
        # Your code here

        # Get user id
        body = request.get_json()
        user_id = body.get('user_id')

        # Check if user id is missing
        if not user_id:
            return Response(json.dumps({'message': 'user id is required'}), mimetype="application/json", status=400)
        
        # Check that user id is an int
        if not isinstance(user_id, int):
            return Response(json.dumps({'message': 'user id is not an integer'}), mimetype="application/json", status=400)
        
        # Check that user id exists
        all_user_ids = User.query.all()
        checker = 0
        for instance in all_user_ids:
            if user_id == instance.id:
                checker = 1
        if checker == 0:
            return Response(json.dumps({'message': 'Invalid user id'}), mimetype="application/json", status=404)
        
        # Check that current user is not already following
        follows = Following.query.filter_by(user_id=self.current_user.id).order_by('following_id').all()
        for follow in follows:
            if user_id == follow.following_id:
                return Response(json.dumps({'message': 'No duplicate follows'}), mimetype="application/json", status=400)
        
        # Create new follow
        new_following = Following(self.current_user.id, user_id)
        db.session.add(new_following)
        db.session.commit()
        return Response(json.dumps(new_following.to_dict_following()), mimetype="application/json", status=201)


class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # Your code here

         # Check that user id is an int
        if not id.isdigit():
            return Response(json.dumps({'message': 'Id is not an integer'}), mimetype="application/json", status=400)

        # Check that id exists
        all_following_ids = Following.query.all()
        checker = 0
        for instance in all_following_ids:
            if int(id) == instance.id:
                checker = 1
        if checker == 0:
            return Response(json.dumps({'message': 'Invalid id'}), mimetype="application/json", status=404)
        
        # Check that current user created instance
        following_instance = Following.query.filter_by(id=id)
        if self.current_user.id != following_instance[0].user_id:
            return Response(json.dumps({'message': 'Not authorized to delete following'}), mimetype="application/json", status=404)

        Following.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Following {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
