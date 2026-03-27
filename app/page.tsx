"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Priority = "low" | "medium" | "high";
type Filter = "all" | "active" | "completed";

type Todo = {
  id: number;
  text: string;
  done: boolean;
  dueDate: string;
  priority: Priority;
};

const initialTodos: Todo[] = [
  {
    id: 1,
    text: "Finish the Next.js todo site",
    done: true,
    dueDate: "",
    priority: "high",
  },
  {
    id: 2,
    text: "Add a new task",
    done: false,
    dueDate: "",
    priority: "medium",
  },
  {
    id: 3,
    text: "Mark tasks as complete",
    done: false,
    dueDate: "",
    priority: "low",
  },
];

const filters: Filter[] = ["all", "active", "completed"];
const priorities: Priority[] = ["low", "medium", "high"];
const STORAGE_KEY = "nextjs-todo-items";

const priorityBadge: Record<Priority, string> = {
  low: "badge-info",
  medium: "badge-warning",
  high: "badge-error",
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Todo[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTodos(parsed);
        }
      }
    } catch {
      // ignore localStorage/JSON errors
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, isReady]);

  const stats = useMemo(() => {
    const done = todos.filter((todo) => todo.done).length;
    return {
      total: todos.length,
      done,
      left: todos.length - done,
    };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (filter === "active") return todos.filter((todo) => !todo.done);
    if (filter === "completed") return todos.filter((todo) => todo.done);
    return todos;
  }, [todos, filter]);

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();
    if (!text) return;

    setTodos((current) => [
      {
        id: Date.now(),
        text,
        done: false,
        dueDate,
        priority,
      },
      ...current,
    ]);

    setInput("");
    setDueDate("");
    setPriority("medium");
  }

  function toggleTodo(id: number) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }

  function removeTodo(id: number) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.done));
  }

  function startEditing(todo: Todo) {
    setEditingId(todo.id);
    setEditingText(todo.text);
  }

  function saveEditing(id: number) {
    const text = editingText.trim();
    if (!text) return;

    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, text } : todo)),
    );
    setEditingId(null);
    setEditingText("");
  }

  function updateDueDate(id: number, nextDueDate: string) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, dueDate: nextDueDate } : todo,
      ),
    );
  }

  function updatePriority(id: number, nextPriority: Priority) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, priority: nextPriority } : todo,
      ),
    );
  }

  function handleDrop(targetId: number) {
    if (draggedId === null || draggedId === targetId) return;

    setTodos((current) => {
      const next = [...current];
      const fromIndex = next.findIndex((todo) => todo.id === draggedId);
      const toIndex = next.findIndex((todo) => todo.id === targetId);

      if (fromIndex === -1 || toIndex === -1) return current;

      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setDraggedId(null);
    setDropTargetId(null);
  }

  return (
    <main className="min-h-screen bg-base-200 px-3 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="rounded-box bg-base-100 shadow-lg">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between md:p-5">
            <div>
              <div className="badge badge-primary badge-outline mb-2">Next.js Todo</div>
              <h1 className="text-2xl font-bold md:text-3xl">
                Keep your day under control.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-base-content/70 md:text-base">
                daisyUI todo with editing, deadlines, priorities, filters,
                drag-and-drop, and saved state.
              </p>
            </div>

            <div className="stats stats-horizontal w-full shadow md:w-auto">
              <div className="stat px-4 py-3">
                <div className="stat-title text-xs">Total</div>
                <div className="stat-value text-2xl text-primary">{stats.total}</div>
              </div>
              <div className="stat px-4 py-3">
                <div className="stat-title text-xs">Done</div>
                <div className="stat-value text-2xl text-success">{stats.done}</div>
              </div>
              <div className="stat px-4 py-3">
                <div className="stat-title text-xs">Left</div>
                <div className="stat-value text-2xl text-warning">{stats.left}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-3 p-4">
            <form className="flex flex-col gap-3" onSubmit={addTodo}>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Add a task..."
                  className="input input-bordered w-full flex-1"
                />
                <button type="submit" className="btn btn-primary">
                  Add
                </button>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <label className="form-control w-full">
                  <div className="label py-1">
                    <span className="label-text text-xs">Deadline</span>
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>

                <label className="form-control w-full">
                  <div className="label py-1">
                    <span className="label-text text-xs">Priority</span>
                  </div>
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value as Priority)}
                    className="select select-bordered w-full"
                  >
                    {priorities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </form>

            <div className="alert alert-info alert-soft py-2 text-sm">
              <span>Your tasks are saved in the browser automatically.</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-3 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="join join-horizontal flex flex-wrap">
                {filters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`btn btn-sm join-item capitalize ${
                      filter === item ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={clearCompleted}
                className="btn btn-sm btn-outline btn-error"
              >
                Clear completed
              </button>
            </div>

            {filter === "all" && (
              <div className="alert alert-warning alert-soft py-2 text-sm">
                <span>
                  Drag by <strong>⋮⋮</strong> to reorder.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {visibleTodos.length === 0 ? (
                <div className="card border border-dashed border-base-300 bg-base-200/50">
                  <div className="card-body items-center py-6 text-center text-sm text-base-content/60">
                    No tasks in this view.
                  </div>
                </div>
              ) : (
                visibleTodos.map((todo) => {
                  const isDragged = draggedId === todo.id;
                  const isDropTarget =
                    dropTargetId === todo.id && draggedId !== todo.id;

                  return (
                    <div
                      key={todo.id}
                      draggable={filter === "all"}
                      onDragStart={() => setDraggedId(todo.id)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        if (filter === "all") setDropTargetId(todo.id);
                      }}
                      onDragLeave={() => {
                        if (dropTargetId === todo.id) setDropTargetId(null);
                      }}
                      onDrop={() => handleDrop(todo.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDropTargetId(null);
                      }}
                      className={`card border bg-base-100 transition-all ${
                        isDragged
                          ? "scale-[0.99] opacity-60 border-primary"
                          : isDropTarget
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-base-300"
                      }`}
                    >
                      <div className="card-body gap-3 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start">
                          <div
                            className={`rounded-btn border border-dashed px-2 py-1 text-base leading-none ${
                              filter === "all"
                                ? "cursor-grab border-primary/40 text-primary"
                                : "text-base-content/30"
                            }`}
                            title="Drag to reorder"
                          >
                            ⋮⋮
                          </div>

                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleTodo(todo.id)}
                            className="checkbox checkbox-success checkbox-sm mt-1"
                          />

                          <div className="flex-1">
                            {editingId === todo.id ? (
                              <div className="flex flex-col gap-2">
                                <input
                                  value={editingText}
                                  onChange={(event) =>
                                    setEditingText(event.target.value)
                                  }
                                  className="input input-bordered input-primary input-sm w-full"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveEditing(todo.id)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditingText("");
                                    }}
                                    className="btn btn-ghost btn-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h2
                                  className={`text-base font-semibold ${
                                    todo.done
                                      ? "text-base-content/50 line-through"
                                      : ""
                                  }`}
                                >
                                  {todo.text}
                                </h2>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <div
                                    className={`badge badge-sm ${priorityBadge[todo.priority]} badge-outline`}
                                  >
                                    {todo.priority}
                                  </div>
                                  <div className="badge badge-sm badge-outline">
                                    {todo.dueDate
                                      ? `Due: ${todo.dueDate}`
                                      : "No deadline"}
                                  </div>
                                  {filter === "all" && (
                                    <div className="badge badge-sm badge-outline badge-primary">
                                      Drag
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(todo)}
                              className="btn btn-sm btn-outline btn-info"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTodo(todo.id)}
                              className="btn btn-sm btn-outline btn-error"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-2">
                          <label className="form-control w-full">
                            <div className="label py-1">
                              <span className="label-text text-xs">Deadline</span>
                            </div>
                            <input
                              type="date"
                              value={todo.dueDate ?? ""}
                              onChange={(event) =>
                                updateDueDate(todo.id, event.target.value)
                              }
                              className="input input-bordered input-sm w-full"
                            />
                          </label>

                          <label className="form-control w-full">
                            <div className="label py-1">
                              <span className="label-text text-xs">Priority</span>
                            </div>
                            <select
                              value={todo.priority ?? "medium"}
                              onChange={(event) =>
                                updatePriority(
                                  todo.id,
                                  event.target.value as Priority,
                                )
                              }
                              className="select select-bordered select-sm w-full"
                            >
                              {priorities.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
