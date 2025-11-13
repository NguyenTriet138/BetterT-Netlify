import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
		description: v.optional(v.string()),
		priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
		dueDate: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
		createdAt: v.optional(v.number()),
		updatedAt: v.optional(v.number()),
	}),
});
