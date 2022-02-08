import re
from flask import Response, request
from flask_restful import Resource
from . import can_view_post
import json
from models import db, Comment, Post

class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def post(self):
        # Your code here

        #Get parameters
        body = request.get_json()
        post_id = body.get('post_id')
        text = body.get('text')

        #Check that post id is an integer
        if not isinstance(post_id, int):
            return Response(json.dumps({'message': 'post id is not an integer'}), mimetype="application/json", status=400)
        
        #Check that text is not missing
        if not text or len(text) == 0:
            return Response(json.dumps({'message': 'text must be passed'}), mimetype="application/json", status=400)

        #Check that the post exists and the current user can view it
        post = Post.query.get(post_id)
        if not post or not can_view_post(post_id, self.current_user):
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
        
        #Create comment
        new_comment = Comment(text, self.current_user.id, post_id)
        db.session.add(new_comment)
        db.session.commit()
        return Response(json.dumps(new_comment.to_dict()), mimetype="application/json", status=201)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
  
    def delete(self, id):
        # Your code here

        # Check that id is an int
        if not id.isdigit():
            return Response(json.dumps({'message': 'Id is not an integer'}), mimetype="application/json", status=400)
        
        # Check that id exists
        comment = Comment.query.get(id)
        if not comment or self.current_user.id != comment.user_id:
            return Response(json.dumps({'message': 'Comment does not exist'}), mimetype="application/json", status=404)
        
        # Delete comment
        Comment.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Comment {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': api.app.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<id>', 
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
