import { addMoodService, editMoodService, messagedUsersTodayCount, moodDetailsService, moodsDetailsService, recallMoodService, removeMoodService, totalMessagesService, totalMessagesTodayService } from '../services/adminServices.js';

export const messagesCountDetails = () => {
    return new Promise((resolve, reject) => {
        Promise.allSettled([messagedUsersTodayCount(), totalMessagesService(), totalMessagesTodayService()])
        .then((response) => {
            resolve({messagedUsersToday: response[0]?.value ?? 0, totalMessages: response[1]?.value ?? 0, totalMessagesToday: response[2]?.value ?? 0 })
        })
        .catch((error) => {
            reject({message: "Promise error occured!"});
        })
    })
}

export const addMood = ({name, color}) => {
    return new Promise((resolve, reject) => {
        addMoodService({name, color}).then((response) => {
            resolve(response)
        }).catch((error) => {
            reject(error)
        })
    })
}

export const moodsDetails = () => {
    return new Promise((resolve, reject) => {
        moodsDetailsService().then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error)
        })
    })
}

export const moodDetails = ({id}) => {
    return new Promise((resolve, reject) => {
        moodDetailsService({id}).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error)
        })
    })
}

export const removeMood = ({id}) => {
    return new Promise((resolve, reject) => {
        removeMoodService({id}).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error)
        })
    })
}

export const recallMood = ({id}) => {
    return new Promise((resolve, reject) => {
        recallMoodService({id}).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error)
        })
    })
}

export const editMood = (data) => {
    return new Promise((resolve, reject) => {
        editMoodService(data).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error)
        })
    })
}