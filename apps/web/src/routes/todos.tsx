import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Trash2, Calendar, Tag, Edit, Plus, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";

import { useMutation, useQuery } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";

export const Route = createFileRoute("/todos")({
	component: TodosRoute,
});

type Priority = "low" | "medium" | "high";

interface TodoFormData {
	text: string;
	description?: string;
	priority: Priority;
	dueDate?: number;
	tags?: string[];
}

function TodosRoute() {
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingTodoId, setEditingTodoId] = useState<Id<"todos"> | null>(null);
	const [formData, setFormData] = useState<TodoFormData>({
		text: "",
		description: "",
		priority: "medium",
		tags: [],
	});
	const [tagInput, setTagInput] = useState("");

	const todos = useQuery(api.todos.getAll);
	const createTodo = useMutation(api.todos.create);
	const updateTodo = useMutation(api.todos.update);
	const toggleTodo = useMutation(api.todos.toggle);
	const deleteTodo = useMutation(api.todos.deleteTodo);

	const resetForm = () => {
		setFormData({
			text: "",
			description: "",
			priority: "medium",
			tags: [],
		});
		setTagInput("");
	};

	const handleAddTodo = async (e: React.FormEvent) => {
		e.preventDefault();
		const text = formData.text.trim();
		if (!text) return;
		await createTodo({
			text,
			description: formData.description?.trim() || undefined,
			priority: formData.priority,
			dueDate: formData.dueDate,
			tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
		});
		resetForm();
		setIsAddDialogOpen(false);
	};

	const handleEditTodo = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingTodoId) return;
		const text = formData.text.trim();
		if (!text) return;
		await updateTodo({
			id: editingTodoId,
			text,
			description: formData.description?.trim() || undefined,
			priority: formData.priority,
			dueDate: formData.dueDate,
			tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
		});
		resetForm();
		setIsEditDialogOpen(false);
		setEditingTodoId(null);
	};

	const openEditDialog = (todo: any) => {
		setEditingTodoId(todo._id);
		setFormData({
			text: todo.text,
			description: todo.description || "",
			priority: todo.priority || "medium",
			dueDate: todo.dueDate,
			tags: todo.tags || [],
		});
		setIsEditDialogOpen(true);
	};

	const addTag = () => {
		const tag = tagInput.trim();
		if (tag && !formData.tags?.includes(tag)) {
			setFormData((prev) => ({
				...prev,
				tags: [...(prev.tags || []), tag],
			}));
			setTagInput("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags?.filter((tag) => tag !== tagToRemove),
		}));
	};

	const getPriorityColor = (priority: Priority) => {
		switch (priority) {
			case "high":
				return "destructive";
			case "medium":
				return "default";
			case "low":
				return "secondary";
		}
	};

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "";
		return new Date(timestamp).toLocaleDateString();
	};

	const isOverdue = (dueDate?: number) => {
		if (!dueDate) return false;
		return dueDate < Date.now();
	};

	const handleToggleTodo = (id: Id<"todos">, currentCompleted: boolean) => {
		toggleTodo({ id, completed: !currentCompleted });
	};

	const handleDeleteTodo = (id: Id<"todos">) => {
		deleteTodo({ id });
	};

	const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newText = e.target.value;
		setFormData((prev) => ({ ...prev, text: newText }));
	}, []);

	const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newDescription = e.target.value;
		setFormData((prev) => ({ ...prev, description: newDescription }));
	}, []);

	const handlePriorityChange = useCallback((value: Priority) => {
		setFormData((prev) => ({ ...prev, priority: value }));
	}, []);

	const handleDueDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newDueDate = e.target.value ? new Date(e.target.value).getTime() : undefined;
		setFormData((prev) => ({ ...prev, dueDate: newDueDate }));
	}, []);

	const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setTagInput(newValue);
	}, []);

	return (
		<div className="mx-auto w-full max-w-4xl py-10">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Todo List</CardTitle>
							<CardDescription>Manage your tasks efficiently with priorities, due dates, and tags</CardDescription>
						</div>
						<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
							<DialogTrigger asChild>
								<Button onClick={() => resetForm()}>
									<Plus className="mr-2 h-4 w-4" />
									Add Task
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add New Task</DialogTitle>
									<DialogDescription>
										Create a new task with details, priority, and due date.
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleAddTodo} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="add-text">Task Title *</Label>
										<Input
											id="add-text"
											value={formData.text}
											onChange={handleTextChange}
											placeholder="Enter task title..."
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="add-description">Description</Label>
										<Textarea
											id="add-description"
											value={formData.description}
											onChange={handleDescriptionChange}
											placeholder="Enter task description..."
											className="min-h-[100px]"
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="add-priority">Priority</Label>
											<Select
												value={formData.priority}
												onValueChange={handlePriorityChange}
											>
												<SelectTrigger id="add-priority">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="low">Low</SelectItem>
													<SelectItem value="medium">Medium</SelectItem>
													<SelectItem value="high">High</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label htmlFor="add-dueDate">Due Date</Label>
											<Input
												id="add-dueDate"
												type="date"
												value={
													formData.dueDate
														? new Date(formData.dueDate).toISOString().split("T")[0]
														: ""
												}
												onChange={handleDueDateChange}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="add-tags">Tags</Label>
										<div className="flex gap-2">
											<Input
												id="add-tags"
												value={tagInput}
												onChange={handleTagInputChange}
												placeholder="Add a tag..."
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														addTag();
													}
												}}
											/>
											<Button type="button" onClick={addTag} variant="outline" size="icon">
												<Plus className="h-4 w-4" />
											</Button>
										</div>
										{formData.tags && formData.tags.length > 0 && (
											<div className="flex flex-wrap gap-2 mt-2">
												{formData.tags.map((tag) => (
													<Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
														{tag} ×
													</Badge>
												))}
											</div>
										)}
									</div>

									<DialogFooter>
										<Button type="submit" disabled={!formData.text.trim()}>
											Save Task
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
				<CardContent>

					{todos === undefined ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin" />
						</div>
					) : todos.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground">No todos yet. Click "Add Task" to create your first task!</p>
					) : (
						<div className="space-y-3">
							{todos.map((todo) => (
								<div
									key={todo._id}
									className="rounded-lg border p-4 hover:bg-accent/50 transition-colors"
								>
									<div className="flex items-start gap-3">
										<Checkbox
											checked={todo.completed}
											onCheckedChange={() => handleToggleTodo(todo._id, todo.completed)}
											id={`todo-${todo._id}`}
											className="mt-1"
										/>
										<div className="flex-1 space-y-2">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<label
														htmlFor={`todo-${todo._id}`}
														className={`font-medium cursor-pointer ${
															todo.completed ? "line-through text-muted-foreground" : ""
														}`}
													>
														{todo.text}
													</label>
													{todo.description && (
														<p className="text-sm text-muted-foreground mt-1">
															{todo.description}
														</p>
													)}
												</div>
												<div className="flex gap-1">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => openEditDialog(todo)}
														aria-label="Edit todo"
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleDeleteTodo(todo._id)}
														aria-label="Delete todo"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>

											<div className="flex flex-wrap items-center gap-2 text-sm">
												<Badge variant={getPriorityColor(todo.priority || "medium")}>
													{todo.priority || "medium"}
												</Badge>

												{todo.dueDate && (
													<div
														className={`flex items-center gap-1 ${
															isOverdue(todo.dueDate) && !todo.completed
																? "text-destructive"
																: "text-muted-foreground"
														}`}
													>
														{isOverdue(todo.dueDate) && !todo.completed && (
															<AlertCircle className="h-3 w-3" />
														)}
														<Calendar className="h-3 w-3" />
														<span>{formatDate(todo.dueDate)}</span>
													</div>
												)}

												{todo.tags && todo.tags.length > 0 && (
													<div className="flex items-center gap-1">
														<Tag className="h-3 w-3 text-muted-foreground" />
														{todo.tags.map((tag) => (
															<Badge key={tag} variant="outline" className="text-xs">
																{tag}
															</Badge>
														))}
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Task</DialogTitle>
						<DialogDescription>
							Update task details, priority, and due date.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEditTodo} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="edit-text">Task Title *</Label>
							<Input
								id="edit-text"
								value={formData.text}
								onChange={handleTextChange}
								placeholder="Enter task title..."
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-description">Description</Label>
							<Textarea
								id="edit-description"
								value={formData.description}
								onChange={handleDescriptionChange}
								placeholder="Enter task description..."
								className="min-h-[100px]"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="edit-priority">Priority</Label>
								<Select
									value={formData.priority}
									onValueChange={handlePriorityChange}
								>
									<SelectTrigger id="edit-priority">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="edit-dueDate">Due Date</Label>
								<Input
									id="edit-dueDate"
									type="date"
									value={
										formData.dueDate
											? new Date(formData.dueDate).toISOString().split("T")[0]
											: ""
									}
									onChange={handleDueDateChange}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-tags">Tags</Label>
							<div className="flex gap-2">
								<Input
									id="edit-tags"
									value={tagInput}
									onChange={handleTagInputChange}
									placeholder="Add a tag..."
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addTag();
										}
									}}
								/>
								<Button type="button" onClick={addTag} variant="outline" size="icon">
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							{formData.tags && formData.tags.length > 0 && (
								<div className="flex flex-wrap gap-2 mt-2">
									{formData.tags.map((tag) => (
										<Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
											{tag} ×
										</Badge>
									))}
								</div>
							)}
						</div>

						<DialogFooter>
							<Button type="submit" disabled={!formData.text.trim()}>
								Save Task
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}

