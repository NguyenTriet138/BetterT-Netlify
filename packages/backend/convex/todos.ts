import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
	handler: async (ctx) => {
		const todos = await ctx.db.query("todos").collect();
		// Ensure all todos have required fields with defaults
		return todos.map((todo) => ({
			...todo,
			priority: todo.priority ?? "medium",
			createdAt: todo.createdAt ?? todo._creationTime,
			updatedAt: todo.updatedAt ?? todo._creationTime,
		}));
	},
});

export const create = mutation({
	args: {
		text: v.string(),
		description: v.optional(v.string()),
		priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
		dueDate: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const newTodoId = await ctx.db.insert("todos", {
			text: args.text,
			completed: false,
			description: args.description,
			priority: args.priority ?? "medium",
			dueDate: args.dueDate,
			tags: args.tags,
			createdAt: now,
			updatedAt: now,
		});
		return await ctx.db.get(newTodoId);
	},
});

export const toggle = mutation({
	args: {
		id: v.id("todos"),
		completed: v.boolean(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { 
			completed: args.completed,
			updatedAt: Date.now(),
		});
		return { success: true };
	},
});

export const update = mutation({
	args: {
		id: v.id("todos"),
		text: v.optional(v.string()),
		description: v.optional(v.string()),
		priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
		dueDate: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		await ctx.db.patch(id, {
			...updates,
			updatedAt: Date.now(),
		});
		return { success: true };
	},
});

export const deleteTodo = mutation({
	args: {
		id: v.id("todos"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return { success: true };
	},
});
