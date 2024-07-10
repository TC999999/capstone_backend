const Message = require("./messages.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  let newMessage = {
    from_username: "u2",
    to_username: "u1",
    item_id: 1,
    body: "test body",
  };

  test("works", async function () {
    let message = await Message.create(newMessage);
    expect(message).toEqual({
      id: 3,
      from_username: "u2",
      to_username: "u1",
      item_id: 1,
      body: "test body",
      sent_at: expect.any(Date),
    });
  });
});

describe("get conversation", function () {
  test("works", async function () {
    let conversation = await Message.getConversation(4, "u3", "u1");
    expect(conversation).toEqual({
      conversation: [
        {
          id: 2,
          from_username: "u3",
          to_username: "u1",
          item_name: "i4",
          itemID: 4,
          body: "test body",
          sent_at: expect.any(Date),
        },
        {
          id: 1,
          from_username: "u1",
          to_username: "u3",
          item_name: "i4",
          itemID: 4,
          body: "test body",
          sent_at: expect.any(Date),
        },
      ],
    });
  });
});
