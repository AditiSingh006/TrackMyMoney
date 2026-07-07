import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

const transactionResolver = {
    Query: {
        transactions: async (_, __, context) => {
            try {
                if (!context.getUser()) throw new Error("Unauthorized");
                const userId = await context.getUser()._id;

                const transactions = await Transaction.find({ userId });
                return transactions;
            } catch (error) {
                console.error("Error fetching transactions:", error);
                throw new Error(error.message || "Internal server error");
            }
        },
        transaction: async(_, {transactionId},) => {
            try {
                const transaction = await Transaction.findById(transactionId);
                return transaction;
            } catch (error) {
                console.error("Error fetching transaction:", error);
                throw new Error(error.message || "Internal server error");
            }
        },

        categoryStatistics: async (_, __, context) => {
            if(!context.getUser()) throw new Error("Unauthorized");

            const userId = context.getUser()._id;
            const transactions = await Transaction.find({ userId });
            const categoryMap = {};

            transactions.forEach(transaction => {
                if(!categoryMap[transaction.category]) {
                    categoryMap[transaction.category] = 0;
                }
                categoryMap[transaction.category] += transaction.amount;
            });

            return Object.entries(categoryMap).map(([category, totalAmount]) => ({category, totalAmount}));

        }

    },
    Mutation: {
        createTransaction: async(_, { input }, context) =>{
            try {
                const newTransaction = new Transaction({
                    ...input,
                    userId: context.getUser()._id,
                });
                await newTransaction.save();
                return newTransaction;
            } catch (error) {
                console.error("Error creating transaction:", error);
                throw new Error(error.message || "Internal server error");
            }
        },
        updateTransaction: async(_, {input}) =>{
            try {
                const updateTransaction = await Transaction.findByIdAndUpdate(input.transactionId, input, { new: true });
                return updateTransaction;
            } catch (error) {
                console.error("Error updating transaction:", error);
                throw new Error(error.message || "Internal server error");
            }
        },
        deleteTransaction: async(_, {transactionId}) =>{
            try {
                const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);
                return deletedTransaction;
            } catch (error) {
                console.error("Error deleting transaction:", error);
                throw new Error(error.message || "Internal server error");
            }
        },
    },

    Transaction: {
        user: async(parent) => {
            const userId = parent.userId;
            try {
                const user = await User.findById(userId);
                return user;
            } catch (error) {
                console.error("Error getting user:", error);
                throw new Error("Error getting user");
            }
        }
    }
};

export default transactionResolver