const jwt = require("jsonwebtoken");

// set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ req }) {
    // allows token to be sent via req.body, req.query, or headers
    let token = req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (token) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return { user: null };
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret);
      return { user: data };
    } catch {
      console.log("Invalid token");
      return { user: null };
    }
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
  AuthenticationError: new Error("Could not authenticate user."),
};
