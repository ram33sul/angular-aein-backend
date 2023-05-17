const onError = (userId, clients) =>{
    return () => {
        clients.delete(userId);
    }
}

export default onError;