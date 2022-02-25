const rootURL = 'https://photo-app-demo.herokuapp.com';
const story2Html = story => {
    return `
        <div>
            <img src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <p>${ story.user.username }</p>
        </div>
    `;
};

// fetch data from your API endpoint:
const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};

const destroyModal = (ev, postId) => {
    //console.log("Destory Modal Called");
    //const postId = ev.currentTarget.dataset.postId;
    document.querySelector('#modal-container').innerHTML = "";
    document.querySelector('#commentsButton-' + postId).focus();
};

const getAllComments = comments => {
    console.log("Get All Comments called");
    let html = '';
    for (let i = 0; i < comments.length; i++){
        html += `
        <div>
            <img src="${comments[i].user.thumb_url}" class="pic" alt="profile pic for ${comments[i].user.username}"/>
            <p>${comments[i].user.username}</p>
            <p>${comments[i].text}</p>
        </div>
        `;
    }
    const htmlWrapper = 
    `<div class="modal-comments">
        ${html}
    </div>`;
    return htmlWrapper;
}

const showPostDetail = ev => {
    const postId = ev.currentTarget.dataset.postId;
    fetch(`/api/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            let html = `
                <div class="modal-bg">
                    <button id="modal-button-${postId}"
                            onclick="destroyModal(event, ${postId})"
                            aria-label="Close"
                            aria-checked="False">Close</button>
                    <div class="modal">
                        <img src="${post.image_url}" />
                        ${getAllComments(post.comments)}
                    </div>
                </div>`;
            document.querySelector('#modal-container').innerHTML = html;
            document.querySelector('#modal-button-' + postId).focus();
            document.addEventListener('keydown', function handler(event){
                if (event.key === 'Escape') {
                    destroyModal(ev, postId);
                    this.removeEventListener('keydown', handler);
                }
            });
        })
    
};

const postComment = ev => {
    let commentLength = ev.currentTarget.dataset.commentLength;
    let postID = ev.currentTarget.dataset.postId;
    let txtvalue = document.getElementById("comment-box-" + postID).value;
    document.getElementById("comment-box-" + postID).value = "";
    console.log(commentLength);
    console.log(txtvalue);
    const postData = {
        "post_id": parseInt(postID),
        "text": txtvalue
    };
    
    fetch("/api/comments", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            newCommentLength = parseInt(commentLength) + 1;
            let elem = document.getElementById("shownComment-" + postID);
            elem.innerHTML = `
            <strong>${data.user.username}</strong> 
                ${data.text}
            `;
            elem = document.getElementById("postButton-" + postID);
            elem.setAttribute("data-comment-length", newCommentLength.toString());
            if (newCommentLength > 1){
                console.log("entered if")
                elem = document.getElementById("commentsButton-" + postID);
                elem.innerHTML = 'view all ' + newCommentLength.toString() + ' comments';
            }
        });
}

const displayComments = (comments, postID) => {
    let html = '';
    if (comments.length > 1) {
        html += `
            <button id="commentsButton-${postID}" class="link" data-post-id="${postID}" onclick="showPostDetail(event);">
                view all ${comments.length} comments
            </button>
        `;
    }
    if (comments && comments.length > 0) {
        const lastComment = comments[comments.length - 1];
        html += `
            <p id="shownComment-${postID}">
                <strong>${lastComment.user.username}</strong> 
                ${lastComment.text}
            </p>
            <div>${lastComment.display_time}</div>
        `
    }
    html += `
        <div class="add-comment">
            <div class="input-holder">
                <input id= "comment-box-${postID}" type="text" aria-label="Add a comment" placeholder="Add a comment...">
            </div>
            <button id="postButton-${postID}"class="link" onclick="postComment(event)"
                    data-comment-length="${comments.length}"
                    data-post-id="${postID}">Post</button>
        </div>
    `;
    return html;
};


/*
<section class="card">
        Already done
       
        <div class="caption">
            <p>
                <strong>{{ post.get('user').get('username') }}</strong> 
                {{ post.title }}.. <button class="link">more</button>
            </p>
        </div>
        <div class="comments">
            {% if post.get('comments')|length > 1 %}
                <p><button class="link">View all {{ post.get('comments')|length }} comments</button></p>
            {% endif %}
            {% for comment in post.get('comments')[:1] %}
                <p>
                    <strong>{{ comment.get('user').get('username') }}</strong> 
                    {{ comment.get('text') }}
                </p>
            {% endfor %}
            <p class="timestamp">{{ post.get('display_time') }}</p>
        </div>
    </div>
    <div class="add-comment">
        <div class="input-holder">
            <input type="text" aria-label="Add a comment" placeholder="Add a comment...">
        </div>
        <button class="link">Post</button>
    </div>
</section>

*/

const likeUnlike = ev => {
    const postID = ev.currentTarget.dataset.postId;
    const isLiked = ev.currentTarget.dataset.isLiked;
    let numOfLikes = ev.currentTarget.dataset.numLikes;
    console.log(postID);
    console.log(isLiked);
    console.log(isLiked !== "undefined")
    console.log(numOfLikes);
    if (isLiked !== "undefined"){
        fetch('api/posts/' + postID + '/likes/' + isLiked, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let elem = document.querySelector(`#likes-${postID}`);
            numOfLikes = parseInt(numOfLikes) - 1;
            let txt = 's';
            if (numOfLikes == 1){
                txt = '';
            }
            elem.innerHTML = 
            '<strong>' + numOfLikes.toString() + ' like' + txt + '</strong>';
            elem = document.querySelector(`#likeButton-${postID}`);
            elem.innerHTML = '<i class="far fa-heart"></i>';
            elem.setAttribute('data-is-liked', "undefined");
            elem.setAttribute('data-num-likes', numOfLikes.toString());
            elem.setAttribute('aria-checked', 'false');
            elem.setAttribute('aria-label', 'Like');
        });
    }
    else{
        fetch('/api/posts/' + postID + '/likes/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    let elem = document.querySelector(`#likes-${postID}`);
                    numOfLikes = parseInt(numOfLikes) + 1;
                    let txt = 's';
                    if (numOfLikes == 1){
                        txt = ''
                    }
                    elem.innerHTML = 
                    '<strong>' + numOfLikes.toString() + ' like' + txt + '</strong>';
                    elem = document.querySelector(`#likeButton-${postID}`);
                    elem.innerHTML = '<i class="fas fa-heart"></i>';
                    elem.setAttribute('data-is-liked', data.id);
                    elem.setAttribute('data-num-likes', numOfLikes.toString());
                    elem.setAttribute('aria-checked', 'true');
                    elem.setAttribute('aria-label', 'Unlike');
            });
    }
};

const toggleBookmark = ev => {
    const postID = ev.currentTarget.dataset.postId;
    const isBookmarked = ev.currentTarget.dataset.isBookmarked;
    console.log(postID);
    console.log(isBookmarked);
    console.log(isBookmarked !== "undefined")
    if (isBookmarked !== "undefined"){
        fetch('api/bookmarks/' + isBookmarked, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let elem = document.querySelector(`#bookmark-${postID}`);
            elem.innerHTML = '<i class="far fa-bookmark"></i>';
            elem.setAttribute('data-is-bookmarked', "undefined");
            elem.setAttribute('aria-checked', 'false');
            elem.setAttribute('aria-label', 'Bookmark');
        });
    }
    else{
        fetch('/api/bookmarks/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"post_id" : postID})
        })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    let elem = document.querySelector(`#bookmark-${postID}`);
                    elem.innerHTML = '<i class="fas fa-bookmark"></i>';
                    elem.setAttribute('data-is-bookmarked', data.id);
                    elem.setAttribute('aria-checked', 'true');
                    elem.setAttribute('aria-label', 'Unbookmark');
            });
    }
};

const post2Html = post => {
    return `
        <section class="card">
            <div class="header">
                <h3>${ post.user.username }</h3>
                <i class="fa fa-dots"></i>
            </div>
            <img src="${ post.image_url }" alt="Image posted by ${ post.user.username }" width="300" height="300">
            <div class="info">
                <div class="buttons">
                    <div>
                        <button id="likeButton-${post.id}" 
                            onclick="likeUnlike(event)"
                            data-post-id="${post.id}"
                            data-is-liked="${post.current_user_like_id}"
                            aria-checked="${post.current_user_like_id ? 'true' : 'false'}"
                            aria-label="${post.current_user_like_id ? 'Unlike' : 'Like'}"
                            data-num-likes=${post.likes.length}>
                            <i class="fa${ post.current_user_like_id ? 's' : 'r' } fa-heart"></i>
                        </button>
                        <i class="far fa-comment"></i>
                        <i class="far fa-paper-plane"></i>
                    </div>
                    <div>
                        <button id="bookmark-${post.id}"
                            onclick="toggleBookmark(event)"
                            data-post-id="${post.id}"
                            data-is-bookmarked="${post.current_user_bookmark_id}"
                            aria-checked="${ post.current_user_bookmark_id ? 'true' : 'false'}"
                            aria-label="${ post.current_user_bookmark_id ? 'Unbookmark' : 'Bookmark'}">
                            <i class="fa${ post.current_user_bookmark_id ? 's' : 'r' } fa-bookmark"></i>
                        </button>
                    </div>
                </div>
                <p id="likes-${post.id}" 
                    class="likes"><strong>${ post.likes.length } like${post.likes.length != 1 ? 's' : ''}</strong></p>

                <div class="caption">
                <p>
                    <strong>${ post.user.username }</strong> 
                    ${ post.caption }
                </p>
            </div>
            <div class="comments">
                ${ displayComments(post.comments, post.id) }
            </div>
        </section>
    `;
};

// fetch data from your API endpoint:
const displayPosts = () => {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('#posts').innerHTML = html;
        })
};


/*********************
 * Display Suggestions
 *********************/
const suggestion2Html = user => {
    return `
        <section>
            <img src="${ user.thumb_url }" class="pic" alt="Profile pic for ${ user.username }" />
            <div>
                <p>${ user.username }</p>
                <p>suggested for you</p>
            </div>
            <div>
                <button 
                    class="link following" 
                    id="follow-${ user.id }" 
                    data-username="${ user.username }" 
                    data-user-id="${ user.id }" 
                    aria-checked="false" 
                    aria-label="Follow ${ user.username }" 
                    onclick="toggleFollow(event)">follow
                </button>
            </div>
        </section>
    `;
};

// fetch data from your API endpoint:    
const displaySuggestions = () => {
    fetch('/api/suggestions')
        .then(response => response.json())
        .then(suggestedUsers => {
            document.querySelector('.suggestions > div').innerHTML = 
            suggestedUsers.map(suggestion2Html).join('\n');
        });
};


/**************************
 * FOLLOWING / UNFOLLOWING
 **************************/
const toggleFollow = ev => {
    const elem = ev.currentTarget;
    const userId = elem.dataset.userId;
    if (elem.getAttribute('aria-checked').trim() === 'false') {
        follow(userId);
    } else {
        const followingId = elem.dataset.followingId;
        unfollow(followingId, userId);
    }
};

const follow = userId => {
    console.log(userId);
    const postData = {
        "user_id": userId
    };    
    fetch('api/following/', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const elem = document.querySelector(`#follow-${data.following.id}`);
        elem.innerHTML = 'unfollow';
        elem.classList.add('active');
        elem.setAttribute('aria-checked', 'true');
        elem.setAttribute('aria-label', "Unfollow " + elem.dataset.username);
        elem.setAttribute('data-following-id', data.id);
    });
};

const unfollow = (followingId, userId) => {
    console.log('unfollow', followingId, userId);
    fetch(`/api/following/${followingId}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const elem = document.querySelector(`#follow-${userId}`);
        elem.innerHTML = 'follow';
        elem.classList.remove('active');
        elem.removeAttribute('data-following-id');
        elem.setAttribute('aria-checked', 'false');
        elem.setAttribute('aria-label', "Follow " + elem.dataset.username);
    });
};

const displayProfile = () => {
    fetch('/api/profile')
        .then(response => response.json())
        .then(profile => {
            const html = `
            <section>
                <img src="${ profile.thumb_url }" class="pic" alt="Profile pic for ${ profile.username }" />
                <p>${ profile.username }</p>
            </section>
            `
            document.querySelector('.profile').innerHTML = html;
        })
};

// 1. Get the post data from the API endpoint (/api/posts?limit=10)
// 2. When that data arrives, we're going to build a bunch of HTML cards (i.e. a big string).
// 3. Update the container and put the html on the inside of it.

const initPage = () => {
    displayStories();
    displayPosts();
    displaySuggestions();
    displayProfile();
};

// invoke init page to display stories:
initPage();