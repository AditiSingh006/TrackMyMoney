import { users } from '../dummyData/data.js'
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import Transaction from "../models/transaction.model.js";

const userResolver = {
    Mutation: {
        signUp: async(_, {input},context) => {
            try {
                const {username, name, password, gender} = input;

                if(!username || !name || !password || !gender){
                    throw new Error("All fields are required");
                }

                const exisitingUser = await User.findOne({ username});

                if(exisitingUser){
                    throw new Error("User already exists");
                }

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                const profilePicture = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${encodeURIComponent(username)}`;

                const newUser = new User({
                    username,
                    name,
                    password: hashedPassword,
                    gender,
                    profilePicture,
                });

                await newUser.save();
                await context.login(newUser);
                return newUser;

            } catch (err) {
                console.error("Error in signUp:", err);
                throw new Error(err.message || "Internal server error");
            }
        },

        login: async(_, {input}, context) => {
            try {
                const {username, password} = input;
                if(!username || !password) throw new Error("All fields are required");
                const {user} = await context.authenticate("graphql-local", {username, password});

                await context.login(user);
                return user;
            } catch (error) {
                console.error("Error in login:", error);
                throw new Error(error.message || "Internal server error");
            }
        },

        logout: async(_,__,context) => {
            try {
                await context.logout();
                context.req.session.destroy((err) => {
                    if(err) throw err;
                });
                context.res.clearCookie("connect.sid");

                return { message: "Logged out successfully" };

            } catch (err) {
                console.error("Error in logout:", err);
                throw new Error(err.message || "Internal server error");
            }
        },
    },
    Query: {
        authUser: async(_,__,context) => {
            try {
                const user = await context.getUser();
                return user;
            } catch (error) {
                console.error("Error in authUser:", error);
                throw new Error(error.message || "Internal server error");
            }
        },
        user: async (_, {userId}) => {
            try {
                const user = await User.findById(userId);
                return user;
            } catch (error) {
                console.error("Error in user query:", error);
                throw new Error(error.message || "Internal server error");
            }
        },
    },

    // to do: add user/tranaction relation
    User: {
        transactions: async (parent) => {
            try {
                const transactions = await Transaction.find({userId: parent._id});
                return transactions;
            } catch (error) {
                console.log("Error in user.transactions resolver:", error);
                throw new Error(error.message || "Internal server error");
            }
        },
    },
};

export default userResolver;