export enum QUERY_KEYS {
  // Existing keys...
  // AUTH KEYS
  CREATE_USER_ACCOUNT = "createUserAccount",
  GET_CURRENT_USER = "getCurrentUser",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",
  // POST KEYS
  GET_POSTS = "getPosts",
  GET_INFINITE_POSTS = "getInfinitePosts",
  GET_RECENT_POSTS = "getRecentPosts",
  GET_SAVED_POSTS = "getSavedPosts",
  GET_POST_BY_ID = "getPostById",
  GET_USER_POSTS = "getUserPosts",
  GET_FILE_PREVIEW = "getFilePreview",
  // SEARCH KEYS
  SEARCH_POSTS = "getSearchPosts",
  // Relationship keys
  FOLLOW_USER = "followUser",
  UNFOLLOW_USER = "unfollowUser",
  GET_USER_RELATIONSHIPS = "getUserRelationships",
  GET_USER_RELATIONSHIPS_LIST = "getUserRelationshipsList",
  GET_USER_RELATIONSHIPS_FOLLOWERSLIST = "getFollowers",
  // COMMENTS KEYS
  GET_COMMENTS_BY_POST = "getCommentsByPost",
  CREATE_COMMENT = "createComment",
  DELETE_COMMENT = "deleteComment",
  // New keys for messages
  GET_MESSAGES = "getMessages",
  CREATE_MESSAGE = "createMessage",
  DELETE_MESSAGE = "deleteMessage",
  // New keys for posts
  GET_ALL_POSTS = "getAllPosts",
  GET_FOLLOWING_POSTS = "getFollowingPosts",
  GET_FOLLOWERS_POSTS = "getFollowersPosts",
  // New key for top users
  GET_TOP_USERS = "getTopUsers", // Add this line
  GET_NOTIFICATIONS = "GET_NOTIFICATIONS",
}

