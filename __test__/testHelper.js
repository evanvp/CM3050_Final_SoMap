// testHelper.js
// Functions similar as implemented in screens 

export const fetchOtherUsersLogic = (allUserDocs, currentUserId) => {
  const onlineUsers = [];
  allUserDocs.forEach((docSnap) => {
    if (docSnap.id !== currentUserId) {
      const data = docSnap.data();
      if (data.online && data.location) {
        onlineUsers.push({ id: docSnap.id, ...data });
      }
    }
  });
  return onlineUsers;
};

export const renderMessageLogic = (message, currentUserId) => {
  const isMe = message.senderId === currentUserId;
  return {
    text: message.text,
    color: isMe ? "white" : "black",
    bubbleStyle: isMe ? "myMessage" : "theirMessage",
  };
};

