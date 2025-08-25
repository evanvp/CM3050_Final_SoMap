// App.test.js for jest
// Function Logic unit test

import { fetchOtherUsersLogic, renderMessageLogic } from "./testHelper";

describe("SoMap App Unit Tests", () => {
  it("fetchOtherUsersLogic returns only online users with location excluding current user", () => {
    const currentUserId = "1";
    const allUserDocs = [
      { id: "1", data: () => ({ online: true, location: {} }) },
      { id: "2", data: () => ({ online: true, location: { lat: 0, lng: 0 } }) },
      { id: "3", data: () => ({ online: false, location: { lat: 0, lng: 0 } }) },
      { id: "4", data: () => ({ online: true }) },
    ];

    const result = fetchOtherUsersLogic(allUserDocs, currentUserId);
    expect(result).toEqual([{ id: "2", online: true, location: { lat: 0, lng: 0 } }]);
  });

  it("renderMessageLogic sets correct color and bubbleStyle based on sender", () => {
    const currentUserId = "user123";
    const msg1 = { senderId: "user123", text: "Hello" };
    const msg2 = { senderId: "other456", text: "Hi" };

    expect(renderMessageLogic(msg1, currentUserId)).toEqual({
      text: "Hello",
      color: "white",
      bubbleStyle: "myMessage",
    });

    expect(renderMessageLogic(msg2, currentUserId)).toEqual({
      text: "Hi",
      color: "black",
      bubbleStyle: "theirMessage",
    });
  });
});
