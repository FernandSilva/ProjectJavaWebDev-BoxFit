export enum QUERY_KEYS {
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
  SEARCH_USERS_AND_POSTS = "searchUsersAndPosts", // ✅ Added key

  // RELATIONSHIP KEYS
  FOLLOW_USER = "followUser",
  UNFOLLOW_USER = "unfollowUser",
  GET_USER_RELATIONSHIPS = "getUserRelationships",
  GET_USER_RELATIONSHIPS_LIST = "getUserRelationshipsList",
  GET_USER_RELATIONSHIPS_FOLLOWERSLIST = "getFollowers",

  // COMMENTS KEYS
  GET_COMMENTS_BY_POST = "getCommentsByPost",
  CREATE_COMMENT = "createComment",
  DELETE_COMMENT = "deleteComment",

  // MESSAGES KEYS
  GET_MESSAGES = "getMessages",
  CREATE_MESSAGE = "createMessage",
  DELETE_MESSAGE = "deleteMessage",

  // POSTS FILTER KEYS
  GET_ALL_POSTS = "getAllPosts",
  GET_FOLLOWING_POSTS = "getFollowingPosts",
  GET_FOLLOWERS_POSTS = "getFollowersPosts",

  // NOTIFICATIONS
  GET_NOTIFICATIONS = "GET_NOTIFICATIONS",
  STORE_PUSH_SUBSCRIPTION= "storePushSubscription",

  // USER STATS
  GET_TOP_USERS = "getTopUsers",
  GET_USER_TOTAL_LIKES = "getUserTotalLikes",
  TOP_memberS = "topmembers", // ✅ Add this line


  
}
