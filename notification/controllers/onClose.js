const onClose = (userId, clients) => {
    return () => {
        clients.delete(userId);
    }
}

export default onClose;