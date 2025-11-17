import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	todos: defineTable({
		// Basic fields
		text: v.string(),
		completed: v.boolean(),
		description: v.optional(v.string()),
		
		// Status & Priority
		status: v.optional(v.union(v.literal("todo"), v.literal("in-progress"), v.literal("in-review"), v.literal("done"), v.literal("cancelled"))),
		priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
		
		// Categorization
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
		
		// Time Management
		dueDate: v.optional(v.number()),
		estimatedMinutes: v.optional(v.number()),
		actualMinutes: v.optional(v.number()),
		startedAt: v.optional(v.number()),
		completedAt: v.optional(v.number()),
		
		// Assignment & Collaboration
		assignee: v.optional(v.string()),
		
		// Additional Resources
		links: v.optional(v.array(v.object({
			url: v.string(),
			title: v.optional(v.string()),
		}))),
		subtasks: v.optional(v.array(v.object({
			id: v.string(),
			text: v.string(),
			completed: v.boolean(),
		}))),
		
		// Metadata
		createdAt: v.optional(v.number()),
		updatedAt: v.optional(v.number()),
	}),
});
