const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).select("-__v -password");
      }
      return null;
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        // Specific error handling for duplicate keys
        if (err.code === 11000) {
          const field = Object.keys(err.keyPattern)[0];
          throw new Error(
            `This ${field} is already taken. Please choose another ${field}.`
          );
        }
        // Handle validation errors
        if (err.name === "ValidationError") {
          const messages = Object.values(err.errors).map(
            (error) => error.message
          );
          throw new Error(messages.join(", "));
        }
        // Generic error
        throw new Error("Error creating user account.");
      }
    },

    login: async (parent, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("No account found with this email address.");
        }

        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new Error("Incorrect password.");
        }

        const token = signToken(user);
        return { token, user };
      } catch (err) {
        throw new Error(err.message);
      }
    },

    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: bookData } },
            { new: true, runValidators: true }
          );
          return updatedUser;
        } catch (err) {
          throw new Error("Error saving book to your list.");
        }
      }
      throw new Error("You need to be logged in!");
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );
          return updatedUser;
        } catch (err) {
          throw new Error("Error removing book from your list.");
        }
      }
      throw new Error("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
