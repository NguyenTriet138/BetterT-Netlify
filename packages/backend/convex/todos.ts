import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
	handler: async (ctx) => {
		const todos = await ctx.db.query("todos").collect();
		// Ensure all todos have required fields with defaults
		return todos.map((todo) => ({
			...todo,
			status: todo.status ?? (todo.completed ? "done" : "todo"),
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
		status: v.optional(v.union(v.literal("todo"), v.literal("in-progress"), v.literal("in-review"), v.literal("done"), v.literal("cancelled"))),
		priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
		category: v.optional(v.union(
			v.literal("work"),
			v.literal("personal"),
			v.literal("shopping"),
			v.literal("health"),
			v.literal("finance"),
			v.literal("learning"),
			v.literal("other")
		)),
		color: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
		dueDate: v.optional(v.number()),
		estimatedMinutes: v.optional(v.number()),
		assignee: v.optional(v.string()),
		links: v.optional(v.array(v.object({
			url: v.string(),
			title: v.optional(v.string()),
		}))),
		subtasks: v.optional(v.array(v.object({
			id: v.string(),
			text: v.string(),
			completed: v.boolean(),
		}))),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const newTodoId = await ctx.db.insert("todos", {
			text: args.text,
			completed: false,
			description: args.description,
			status: args.status ?? "todo",
			priority: args.priority ?? "medium",
			category: args.category,
			color: args.color,
			tags: args.tags,
			dueDate: args.dueDate,
			estimatedMinutes: args.estimatedMinutes,
			assignee: args.assignee,
			links: args.links,
			subtasks: args.subtasks,
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
		status: v.optional(v.union(v.literal("todo"), v.literal("in-progress"), v.literal("in-review"), v.literal("done"), v.literal("cancelled"))),
		priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
		category: v.optional(v.union(
			v.literal("work"),
			v.literal("personal"),
			v.literal("shopping"),
			v.literal("health"),
			v.literal("finance"),
			v.literal("learning"),
			v.literal("other")
		)),
		color: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
		dueDate: v.optional(v.number()),
		estimatedMinutes: v.optional(v.number()),
		actualMinutes: v.optional(v.number()),
		assignee: v.optional(v.string()),
		links: v.optional(v.array(v.object({
			url: v.string(),
			title: v.optional(v.string()),
		}))),
		subtasks: v.optional(v.array(v.object({
			id: v.string(),
			text: v.string(),
			completed: v.boolean(),
		}))),
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		const todo = await ctx.db.get(id);
		if (!todo) throw new Error("Todo not found");
		
		// Auto-update timestamps based on status changes
		const additionalUpdates: any = {};
		if (updates.status === "in-progress" && !todo.startedAt) {
			additionalUpdates.startedAt = Date.now();
		}
		if (updates.status === "done" && !todo.completedAt) {
			additionalUpdates.completedAt = Date.now();
			additionalUpdates.completed = true;
		}
		
		await ctx.db.patch(id, {
			...updates,
			...additionalUpdates,
			updatedAt: Date.now(),
		});
		return { success: true };
	},
});

export const toggleSubtask = mutation({
	args: {
		id: v.id("todos"),
		subtaskId: v.string(),
		completed: v.boolean(),
	},
	handler: async (ctx, args) => {
		const todo = await ctx.db.get(args.id);
		if (!todo || !todo.subtasks) throw new Error("Todo or subtasks not found");
		
		const updatedSubtasks = todo.subtasks.map(subtask =>
			subtask.id === args.subtaskId
				? { ...subtask, completed: args.completed }
				: subtask
		);
		
		await ctx.db.patch(args.id, {
			subtasks: updatedSubtasks,
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
