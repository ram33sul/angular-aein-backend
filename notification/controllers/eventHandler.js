import { comment, dislike, follow, getNotifications, getNotificationsCount, like, reply, seenNotifications, undislike, unfollow, unlike } from '../services/service.js';
import {
    COMMENT,
    DISLIKE,
    FOLLOW, GET_NOTIFICATIONS, GET_NOTIFICATIONS_COUNT, LIKE, REPLY, SEEN_NOTIFICATIONS, UNDISLIKE, UNFOLLOW, UNLIKE
} from './types.js'

const eventHandler = (type) => {
    switch(type){
        case GET_NOTIFICATIONS:
            return getNotifications;
        case GET_NOTIFICATIONS_COUNT:
            return getNotificationsCount;
        case SEEN_NOTIFICATIONS:
            return seenNotifications;
        case FOLLOW:
            return follow;
        case UNFOLLOW:
            return unfollow;
        case LIKE:
            return like;
        case UNLIKE:
            return unlike;
        case DISLIKE:
            return dislike;
        case UNDISLIKE:
            return undislike;
        case COMMENT:
            return comment;
        case REPLY:
            return reply;
        default:
            return null;
    }
}

export default eventHandler;