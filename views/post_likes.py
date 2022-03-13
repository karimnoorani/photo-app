from flask import Response
from flask_restful import Resource
from models import LikePost, db, Post
import json
import flask_jwt_extended
from . import can_view_post

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def post(self, post_id):
        # Your code here
        
        # Check that post id is an int
        if not post_id.isdigit():
            return Response(json.dumps({'message': 'Post id is not an integer'}), mimetype="application/json", status=400)
        
        # Check that the post exists and the current user can view it
        post = Post.query.get(post_id)
        if not post or not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
        
        # Check for duplicates
        potential_duplicates = LikePost.query.filter_by(user_id=self.current_user.id)
        for instance in potential_duplicates:
            if int(post_id) == instance.post_id:
                return Response(json.dumps({'message': 'No duplicate likes'}), mimetype="application/json", status=400)

        # Create Like Post
        new_like = LikePost(self.current_user.id, post_id)        
        db.session.add(new_like)
        db.session.commit()
        return Response(json.dumps(new_like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    def delete(self, post_id, id):
        # Your code here

        # Check that id is an int
        if not id.isdigit():
            return Response(json.dumps({'message': 'Id is not an integer'}), mimetype="application/json", status=400)
        
        # Check that id exists
        like_post = LikePost.query.get(id)
        if not like_post or self.current_user.id != like_post.user_id:
            return Response(json.dumps({'message': 'Like post does not exist'}), mimetype="application/json", status=404)
        
        LikePost.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'LikePost {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
