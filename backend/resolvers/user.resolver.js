import { users } from '../dummyData/data.js'
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

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

                // https://avatar-placeholder.iran.liara.run/
                const boyProfilePic = `https://avatar-placeholder.iran.liara.run/public/boy?username=${username}`;
                const girlProfilePic = `https://avatar-placeholder.iran.liara.run/public/girl?username=${username}`;

                let profilePic;
                if (gender === "male") profilePic = boyProfilePic;
                else if (gender === "female") profilePic = girlProfilePic;
                else profilePic = Math.random() < 0.5 ? boyProfilePic : girlProfilePic;

                const newUser = new User({
                    username,
                    name,
                    password: hashedPassword,
                    gender,
                    profilePic: profilePic
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
                const {user} = await context.authenticate("graphql-local", {username, password});

                await context.login(user);
                return user;
            } catch (error) {
                console.error("Error in login:", error);
                throw new Error(error.message || "Internal server error");
            }
        },

        logout: async(_,__,{req,res}) => {
            try {
                await context.logout();
                req.session.destroy((err) => {
                    if(err) throw err;
                });
                res.clearCookie("connect.sid");

                return { message: "Logged out successfully" };

            } catch (err) {
                console.error("Error in logout:", err);
                throw new Error(err.message || "Internal server error");
            }
        },
    },
    Query: {
        authUser: async(_,__,{req}) => {
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
    
};

export default userResolver;